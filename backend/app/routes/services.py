from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Service
from app.utils.decorators import admin_required, manager_or_admin_required, token_required
from app.utils.validators import validate_service_data
from app.utils.security import validate_file_type, generate_secure_filename, is_safe_path, sanitize_input
from app.utils.rate_limiter import rate_limit
import os
import uuid
from datetime import datetime

services_bp = Blueprint('services', __name__, url_prefix='/api/services')

# List all active services (public)
@services_bp.route('/', methods=['GET'])
def list_services():
    services = Service.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
        'category': s.category,
        'image_url': s.image_url,
        'duration_minutes': s.duration_minutes,
        'price': float(s.price)
    } for s in services])

# Get single service
@services_bp.route('/<int:id>', methods=['GET'])
def get_service(id):
    service = Service.query.get_or_404(id)
    if not service.is_active:
        return jsonify({'error': 'Service not available'}), 404
    
    return jsonify({
        'id': service.id,
        'name': service.name,
        'description': service.description,
        'category': service.category,
        'image_url': service.image_url,
        'duration_minutes': service.duration_minutes,
        'price': float(service.price),
        'is_active': service.is_active
    })

# Add a new service (manager or admin only)
@services_bp.route('/', methods=['POST'])
@manager_or_admin_required
def add_service(current_user):
    data = request.json
    
    # Validate input
    errors = validate_service_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Sanitize string inputs
    service = Service(
        name=sanitize_input(data['name'], max_length=200),
        description=sanitize_input(data.get('description', ''), max_length=1000),
        category=sanitize_input(data.get('category', 'Other'), max_length=100),
        image_url=data.get('image_url'),
        duration_minutes=data['duration_minutes'],
        price=data['price']
    )
    db.session.add(service)
    db.session.commit()
    
    return jsonify({
        'message': f'Service {service.name} added successfully',
        'service': {
            'id': service.id,
            'name': service.name,
            'category': service.category,
            'image_url': service.image_url,
            'duration_minutes': service.duration_minutes,
            'price': float(service.price)
        }
    }), 201

# Update a service (manager or admin only)
@services_bp.route('/<int:id>', methods=['PUT'])
@manager_or_admin_required
def update_service(current_user, id):
    service = Service.query.get_or_404(id)
    data = request.json
    
    # Validate input
    errors = validate_service_data(data, is_update=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    if 'name' in data:
        service.name = sanitize_input(data['name'], max_length=200)
    if 'description' in data:
        service.description = sanitize_input(data['description'], max_length=1000)
    if 'category' in data:
        service.category = sanitize_input(data['category'], max_length=100)
    if 'image_url' in data:
        service.image_url = data.get('image_url')
    service.duration_minutes = data.get('duration_minutes', service.duration_minutes)
    service.price = data.get('price', service.price)
    service.is_active = data.get('is_active', service.is_active)
    db.session.commit()
    
    return jsonify({
        'message': f'Service {service.name} updated successfully',
        'service': {
            'id': service.id,
            'name': service.name,
            'category': service.category,
            'image_url': service.image_url,
            'duration_minutes': service.duration_minutes,
            'price': float(service.price),
            'is_active': service.is_active
        }
    })

# Upload service image (manager or admin only)
@services_bp.route('/upload-image', methods=['POST'])
@manager_or_admin_required
@rate_limit(max_requests=10, window_seconds=60)  # 10 uploads per minute
def upload_image(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    allowed_mime_types = {
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'
    }
    
    is_valid, error_msg = validate_file_type(file, allowed_extensions, allowed_mime_types)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Check file size (max 5MB for service images)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > 5 * 1024 * 1024:  # 5MB
        return jsonify({'error': 'File size must be less than 5MB'}), 400
    
    # Generate secure filename
    secure_name = generate_secure_filename(file.filename, prefix='service')
    
    # Save file
    upload_folder = current_app.config['SERVICES_UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, secure_name)
    
    # Verify path is safe
    if not is_safe_path(upload_folder, file_path):
        return jsonify({'error': 'Invalid file path'}), 400
    
    file.save(file_path)
    
    # Return image URL
    image_url = f"/uploads/services/{secure_name}"
    return jsonify({
        'message': 'Image uploaded successfully',
        'image_url': image_url
    }), 200

# Delete (or deactivate) a service (manager or admin only)
@services_bp.route('/<int:id>', methods=['DELETE'])
@manager_or_admin_required
def delete_service(current_user, id):
    service = Service.query.get_or_404(id)
    service.is_active = False
    db.session.commit()
    return jsonify({'message': f'Service {service.name} deactivated'})
