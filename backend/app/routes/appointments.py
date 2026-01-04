from flask import Blueprint, request, jsonify
from app import db
from app.models import Appointment, Service
from datetime import datetime
from app.utils.decorators import receptionist_or_admin_required, token_required
from app.utils.validators import validate_appointment_data
from app.services.appointment_service import (
    can_book_appointment, 
    check_appointment_conflict,
    get_available_time_slots
)

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

# Create an appointment (public - customers can book)
@appointments_bp.route('/', methods=['POST'])
def create_appointment():
    data = request.json
    
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
    
    # Determine who created it
    created_by = data.get('created_by', 'customer')
    # If token is provided, use authenticated user
    if 'Authorization' in request.headers:
        try:
            from app.utils.decorators import token_required
            # This will be handled by extracting user from token if needed
            created_by = 'receptionist'  # Default for authenticated users
        except:
            pass
    
    appointment = Appointment(
        customer_name=data['customer_name'],
        customer_phone=data['customer_phone'],
        service_id=data['service_id'],
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        created_by=created_by
    )
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({
        'message': 'Appointment created successfully',
        'appointment': {
            'id': appointment.id,
            'customer_name': appointment.customer_name,
            'appointment_date': str(appointment.appointment_date),
            'appointment_time': str(appointment.appointment_time),
            'status': appointment.status
        }
    }), 201

# List all appointments (protected - staff only)
@appointments_bp.route('/', methods=['GET'])
@receptionist_or_admin_required
def list_appointments(current_user):
    # Get query parameters
    status = request.args.get('status')
    date = request.args.get('date')
    service_id = request.args.get('service_id', type=int)
    
    query = Appointment.query
    
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

# Get single appointment
@appointments_bp.route('/<int:id>', methods=['GET'])
@receptionist_or_admin_required
def get_appointment(current_user, id):
    appointment = Appointment.query.get_or_404(id)
    
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
