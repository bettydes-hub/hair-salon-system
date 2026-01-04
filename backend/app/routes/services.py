from flask import Blueprint, request, jsonify
from app import db
from app.models import Service
from app.utils.decorators import admin_required, token_required
from app.utils.validators import validate_service_data

services_bp = Blueprint('services', __name__, url_prefix='/api/services')

# List all active services (public)
@services_bp.route('/', methods=['GET'])
def list_services():
    services = Service.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
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
        'duration_minutes': service.duration_minutes,
        'price': float(service.price),
        'is_active': service.is_active
    })

# Add a new service (admin only)
@services_bp.route('/', methods=['POST'])
@admin_required
def add_service(current_user):
    data = request.json
    
    # Validate input
    errors = validate_service_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    service = Service(
        name=data['name'],
        description=data.get('description'),
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
            'duration_minutes': service.duration_minutes,
            'price': float(service.price)
        }
    }), 201

# Update a service (admin only)
@services_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_service(current_user, id):
    service = Service.query.get_or_404(id)
    data = request.json
    
    # Validate input
    errors = validate_service_data(data, is_update=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    service.name = data.get('name', service.name)
    service.description = data.get('description', service.description)
    service.duration_minutes = data.get('duration_minutes', service.duration_minutes)
    service.price = data.get('price', service.price)
    service.is_active = data.get('is_active', service.is_active)
    db.session.commit()
    
    return jsonify({
        'message': f'Service {service.name} updated successfully',
        'service': {
            'id': service.id,
            'name': service.name,
            'duration_minutes': service.duration_minutes,
            'price': float(service.price),
            'is_active': service.is_active
        }
    })

# Delete (or deactivate) a service (admin only)
@services_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_service(current_user, id):
    service = Service.query.get_or_404(id)
    service.is_active = False
    db.session.commit()
    return jsonify({'message': f'Service {service.name} deactivated'})
