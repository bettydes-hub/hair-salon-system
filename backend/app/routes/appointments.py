from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Appointment, Service
from datetime import datetime
from werkzeug.utils import secure_filename
from app.utils.decorators import receptionist_or_admin_required, manager_or_admin_required, staff_required, token_required
from app.utils.validators import validate_appointment_data
from app.utils.security import sanitize_input, validate_file_type, generate_secure_filename, is_safe_path
from app.utils.rate_limiter import rate_limit
from app.services.appointment_service import (
    can_book_appointment, 
    check_appointment_conflict,
    get_available_time_slots
)
import os
import secrets

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

# Create an appointment (public - customers can book without login)
@appointments_bp.route('/', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=60)  # 10 appointments per minute per IP
def create_appointment():
    # Handle both JSON and form-data (for file uploads)
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
    
    # Sanitize string inputs
    if 'customer_name' in data:
        data['customer_name'] = sanitize_input(data['customer_name'], max_length=100)
    if 'customer_phone' in data:
        data['customer_phone'] = sanitize_input(data['customer_phone'], max_length=20)
    if 'customer_email' in data and data['customer_email']:
        data['customer_email'] = sanitize_input(data['customer_email'], max_length=120).lower()
    
    # Validate input
    errors = validate_appointment_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check if appointment can be booked
    appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
    appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
    
    can_book, message = can_book_appointment(
        data['service_id'],
        appointment_date,
        appointment_time
    )
    
    if not can_book:
        return jsonify({'error': message}), 400
    
    # Get service to calculate deposit
    service = Service.query.get(data['service_id'])
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    # Determine who created it
    created_by = data.get('created_by', 'customer')
    # If token is provided, use authenticated user
    if 'Authorization' in request.headers:
        try:
            from app.utils.decorators import token_required
            created_by = 'receptionist'  # Default for authenticated users
        except:
            pass
    
    # Create appointment
    appointment = Appointment(
        customer_name=data['customer_name'],
        customer_phone=data['customer_phone'],
        customer_email=data.get('customer_email'),
        service_id=data['service_id'],
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        created_by=created_by
    )
    
    # Generate reference number
    appointment.generate_reference_number()
    
    # Handle payment screenshot upload if provided
    if 'payment_screenshot' in request.files:
        file = request.files['payment_screenshot']
        if file and file.filename:
            # Validate file type
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
            allowed_mime_types = {
                'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'
            }
            
            is_valid, error_msg = validate_file_type(file, allowed_extensions, allowed_mime_types)
            if not is_valid:
                return jsonify({'error': error_msg}), 400
            
            # Check file size (max 5MB for payment screenshots)
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            if file_size > 5 * 1024 * 1024:  # 5MB
                return jsonify({'error': 'File size must be less than 5MB'}), 400
            
            # Generate secure filename
            unique_filename = generate_secure_filename(file.filename, prefix=appointment.reference_number)
            filepath = os.path.join(current_app.config['PAYMENT_UPLOAD_FOLDER'], unique_filename)
            
            # Verify path is safe
            if not is_safe_path(current_app.config['PAYMENT_UPLOAD_FOLDER'], filepath):
                return jsonify({'error': 'Invalid file path'}), 400
            
            file.save(filepath)
            appointment.payment_screenshot_url = f"/uploads/payments/{unique_filename}"
            
            # Get payment amount if provided
            if 'payment_amount' in data:
                try:
                    appointment.payment_amount = float(data['payment_amount'])
                except (ValueError, TypeError):
                    pass
    
    db.session.add(appointment)
    db.session.commit()
    
    # Calculate required deposit (10% of service price)
    required_deposit = float(service.price) * 0.10
    
    return jsonify({
        'message': 'Appointment created successfully. Please upload payment screenshot to confirm.',
        'appointment': {
            'id': appointment.id,
            'reference_number': appointment.reference_number,
            'customer_name': appointment.customer_name,
            'appointment_date': str(appointment.appointment_date),
            'appointment_time': str(appointment.appointment_time),
            'status': appointment.status,
            'required_deposit': round(required_deposit, 2),
            'service_price': float(service.price)
        }
    }), 201

# List all appointments (staff see all, clients see only their own)
@appointments_bp.route('/', methods=['GET'])
@token_required
def list_appointments(current_user):
    # Get query parameters
    status = request.args.get('status')
    date = request.args.get('date')
    service_id = request.args.get('service_id', type=int)
    
    query = Appointment.query
    
    # If client, filter to only their appointments (by name or email)
    if current_user.is_client():
        # Clients can only see appointments matching their name
        # When clients book, they should use their registered name
        query = query.filter(
            Appointment.customer_name.ilike(f'%{current_user.name}%')
        )
    
    # Apply filters
    if status:
        query = query.filter(Appointment.status == status)
    if date:
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d').date()
            query = query.filter(Appointment.appointment_date == date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    if service_id:
        query = query.filter(Appointment.service_id == service_id)
    
    appointments = query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()
    
    result = []
    for a in appointments:
        result.append({
            'id': a.id,
            'customer_name': a.customer_name,
            'customer_phone': a.customer_phone,
            'service_id': a.service_id,
            'service_name': a.service.name,
            'appointment_date': str(a.appointment_date),
            'appointment_time': str(a.appointment_time),
            'status': a.status,
            'created_by': a.created_by,
            'created_at': a.created_at.isoformat() if a.created_at else None
        })
    return jsonify(result)

# Get single appointment (staff can view any, client can view their own)
@appointments_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_appointment(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    
    # If client, only allow viewing their own appointments (by name)
    if current_user.is_client():
        if current_user.name.lower() not in appointment.customer_name.lower():
            return jsonify({'error': 'Access denied. You can only view your own appointments'}), 403
    
    return jsonify({
        'id': appointment.id,
        'customer_name': appointment.customer_name,
        'customer_phone': appointment.customer_phone,
        'service_id': appointment.service_id,
        'service_name': appointment.service.name,
        'service_duration': appointment.service.duration_minutes,
        'service_price': float(appointment.service.price),
        'appointment_date': str(appointment.appointment_date),
        'appointment_time': str(appointment.appointment_time),
        'status': appointment.status,
        'created_by': appointment.created_by,
        'created_at': appointment.created_at.isoformat() if appointment.created_at else None
    })

# Update appointment
@appointments_bp.route('/<int:id>', methods=['PUT'])
@receptionist_or_admin_required
def update_appointment(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    data = request.json
    
    # Update fields if provided
    if 'customer_name' in data:
        appointment.customer_name = data['customer_name']
    if 'customer_phone' in data:
        appointment.customer_phone = data['customer_phone']
    if 'service_id' in data:
        service = Service.query.get(data['service_id'])
        if not service or not service.is_active:
            return jsonify({'error': 'Service not available'}), 400
        appointment.service_id = data['service_id']
    if 'appointment_date' in data:
        appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
    if 'appointment_time' in data:
        appointment.appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
    
    # Check for conflicts if date/time changed
    if 'appointment_date' in data or 'appointment_time' in data:
        has_conflict, conflicting = check_appointment_conflict(
            appointment.service_id,
            appointment.appointment_date,
            appointment.appointment_time,
            exclude_id=appointment.id
        )
        if has_conflict:
            return jsonify({'error': 'Time slot is already booked'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Appointment updated successfully',
        'appointment': {
            'id': appointment.id,
            'customer_name': appointment.customer_name,
            'appointment_date': str(appointment.appointment_date),
            'appointment_time': str(appointment.appointment_time),
            'status': appointment.status
        }
    })

# Update appointment status
@appointments_bp.route('/<int:id>/status', methods=['PUT'])
@receptionist_or_admin_required
def update_status(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    data = request.json
    
    status = data.get('status')
    if not status:
        return jsonify({'error': 'Status is required'}), 400
    
    if status not in ['pending', 'confirmed', 'completed', 'cancelled']:
        return jsonify({'error': 'Invalid status. Must be: pending, confirmed, completed, or cancelled'}), 400
    
    appointment.status = status
    db.session.commit()
    
    return jsonify({
        'message': f'Appointment {id} status updated to {status}',
        'appointment': {
            'id': appointment.id,
            'status': appointment.status
        }
    })

# Delete appointment (admin only)
@appointments_bp.route('/<int:id>', methods=['DELETE'])
@receptionist_or_admin_required
def delete_appointment(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    db.session.delete(appointment)
    db.session.commit()
    
    return jsonify({'message': 'Appointment deleted successfully'}), 200

# Get available time slots
@appointments_bp.route('/available-slots', methods=['GET'])
def get_available_slots():
    date_str = request.args.get('date')
    service_id = request.args.get('service_id', type=int)
    
    if not date_str:
        return jsonify({'error': 'Date parameter is required (YYYY-MM-DD)'}), 400
    if not service_id:
        return jsonify({'error': 'service_id parameter is required'}), 400
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    slots = get_available_time_slots(date_obj, service_id)
    
    return jsonify({
        'date': str(date_obj),
        'service_id': service_id,
        'available_slots': slots
    })

# Get appointment by reference number (public - for clients without login)
@appointments_bp.route('/reference/<reference_number>', methods=['GET'])
def get_appointment_by_reference(reference_number):
    appointment = Appointment.query.filter_by(reference_number=reference_number).first_or_404()
    
    service = appointment.service
    required_deposit = float(service.price) * 0.10
    
    return jsonify({
        'id': appointment.id,
        'reference_number': appointment.reference_number,
        'customer_name': appointment.customer_name,
        'customer_phone': appointment.customer_phone,
        'customer_email': appointment.customer_email,
        'service_id': appointment.service_id,
        'service_name': service.name,
        'service_duration': service.duration_minutes,
        'service_price': float(service.price),
        'required_deposit': round(required_deposit, 2),
        'appointment_date': str(appointment.appointment_date),
        'appointment_time': str(appointment.appointment_time),
        'status': appointment.status,
        'payment_screenshot_url': appointment.payment_screenshot_url,
        'payment_amount': float(appointment.payment_amount) if appointment.payment_amount else None,
        'payment_verification_status': appointment.payment_verification_status,
        'payment_verification_notes': appointment.payment_verification_notes,
        'created_at': appointment.created_at.isoformat() if appointment.created_at else None
    })

# Upload payment screenshot to existing appointment (public)
@appointments_bp.route('/<int:id>/upload-payment', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)  # 5 uploads per minute
def upload_payment_screenshot(id):
    appointment = Appointment.query.get_or_404(id)
    
    if 'payment_screenshot' not in request.files:
        return jsonify({'error': 'Payment screenshot is required'}), 400
    
    file = request.files['payment_screenshot']
    if not file or not file.filename:
        return jsonify({'error': 'No file provided'}), 400
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    allowed_mime_types = {
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'
    }
    
    is_valid, error_msg = validate_file_type(file, allowed_extensions, allowed_mime_types)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Check file size (max 5MB)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > 5 * 1024 * 1024:  # 5MB
        return jsonify({'error': 'File size must be less than 5MB'}), 400
    
    # Generate secure filename
    unique_filename = generate_secure_filename(file.filename, prefix=appointment.reference_number)
    filepath = os.path.join(current_app.config['PAYMENT_UPLOAD_FOLDER'], unique_filename)
    
    # Verify path is safe
    if not is_safe_path(current_app.config['PAYMENT_UPLOAD_FOLDER'], filepath):
        return jsonify({'error': 'Invalid file path'}), 400
    
    file.save(filepath)
    
    appointment.payment_screenshot_url = f"/uploads/payments/{unique_filename}"
    
    # Get payment amount if provided
    payment_amount = request.form.get('payment_amount')
    if payment_amount:
        try:
            appointment.payment_amount = float(payment_amount)
        except (ValueError, TypeError):
            pass
    
    # Reset verification status when new payment is uploaded
    appointment.payment_verification_status = 'pending'
    appointment.payment_verified_at = None
    appointment.payment_verified_by = None
    appointment.payment_verification_notes = None
    
    db.session.commit()
    
    # Trigger AI verification (async - in real implementation)
    # For now, we'll create a manual verification endpoint
    
    return jsonify({
        'message': 'Payment screenshot uploaded successfully. Verification pending.',
        'appointment': {
            'id': appointment.id,
            'reference_number': appointment.reference_number,
            'payment_screenshot_url': appointment.payment_screenshot_url,
            'payment_verification_status': appointment.payment_verification_status
        }
    }), 200

# Verify payment (AI or Manager) - Manager can override
@appointments_bp.route('/<int:id>/verify-payment', methods=['POST'])
@manager_or_admin_required
def verify_payment(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    data = request.json
    
    verification_status = data.get('status')  # 'verified' or 'rejected'
    notes = data.get('notes', '')
    
    if verification_status not in ['verified', 'rejected']:
        return jsonify({'error': 'Status must be "verified" or "rejected"'}), 400
    
    if not appointment.payment_screenshot_url:
        return jsonify({'error': 'No payment screenshot uploaded'}), 400
    
    appointment.payment_verification_status = verification_status
    appointment.payment_verified_at = datetime.utcnow()
    appointment.payment_verified_by = f"manager_{current_user.id}" if current_user.is_manager() or current_user.is_admin() else 'ai'
    appointment.payment_verification_notes = notes
    
    # If verified, automatically confirm the appointment
    if verification_status == 'verified':
        appointment.status = 'confirmed'
    
    db.session.commit()
    
    return jsonify({
        'message': f'Payment {verification_status} successfully',
        'appointment': {
            'id': appointment.id,
            'reference_number': appointment.reference_number,
            'status': appointment.status,
            'payment_verification_status': appointment.payment_verification_status,
            'payment_verified_at': appointment.payment_verified_at.isoformat() if appointment.payment_verified_at else None,
            'payment_verified_by': appointment.payment_verified_by
        }
    }), 200

# AI verification endpoint (simulated - in production, this would call actual AI service)
@appointments_bp.route('/<int:id>/ai-verify', methods=['POST'])
def ai_verify_payment(id):
    """
    Simulated AI verification endpoint.
    In production, this would:
    1. Extract text from payment screenshot using OCR
    2. Use AI to identify payment amount and date
    3. Verify amount >= 10% of service price
    4. Return verification result
    """
    appointment = Appointment.query.get_or_404(id)
    
    if not appointment.payment_screenshot_url:
        return jsonify({'error': 'No payment screenshot uploaded'}), 400
    
    if appointment.payment_verification_status != 'pending':
        return jsonify({'error': 'Payment already verified'}), 400
    
    # Get service to calculate required deposit
    service = appointment.service
    required_deposit = float(service.price) * 0.10
    
    # Simulated AI verification logic
    # In production, this would:
    # 1. Download the payment screenshot
    # 2. Use OCR to extract text
    # 3. Use AI/ML to identify payment amount and date
    # 4. Compare with required deposit
    
    # For now, we'll do a simple check if payment_amount is provided
    verification_result = {
        'verified': False,
        'reason': 'AI verification not implemented. Please use manual verification.',
        'extracted_amount': None,
        'extracted_date': None,
        'required_deposit': round(required_deposit, 2)
    }
    
    if appointment.payment_amount:
        if float(appointment.payment_amount) >= required_deposit:
            verification_result['verified'] = True
            verification_result['reason'] = f'Payment amount (${appointment.payment_amount}) meets required deposit (${required_deposit})'
            verification_result['extracted_amount'] = float(appointment.payment_amount)
            
            # Auto-verify if amount is sufficient
            appointment.payment_verification_status = 'verified'
            appointment.payment_verified_at = datetime.utcnow()
            appointment.payment_verified_by = 'ai'
            appointment.payment_verification_notes = verification_result['reason']
            appointment.status = 'confirmed'
            db.session.commit()
        else:
            verification_result['reason'] = f'Payment amount (${appointment.payment_amount}) is less than required deposit (${required_deposit})'
            verification_result['extracted_amount'] = float(appointment.payment_amount)
    
    return jsonify({
        'message': 'AI verification completed',
        'verification': verification_result,
        'appointment': {
            'id': appointment.id,
            'reference_number': appointment.reference_number,
            'status': appointment.status,
            'payment_verification_status': appointment.payment_verification_status
        }
    }), 200
