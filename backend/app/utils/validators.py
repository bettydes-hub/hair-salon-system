"""
Input Validation Utilities
Validate request data before processing
"""
from datetime import datetime, date, time
from flask import jsonify


def validate_email(email):
    """Validate email format"""
    if not email or '@' not in email:
        return False
    return True


def validate_phone(phone):
    """Validate phone number (basic check)"""
    if not phone:
        return False
    # Remove common characters and check if it's mostly digits
    cleaned = ''.join(filter(str.isdigit, phone))
    return len(cleaned) >= 10


def validate_date(date_string, format='%Y-%m-%d'):
    """Validate date string format"""
    try:
        datetime.strptime(date_string, format)
        return True
    except (ValueError, TypeError):
        return False


def validate_time(time_string, format='%H:%M'):
    """Validate time string format"""
    try:
        datetime.strptime(time_string, format)
        return True
    except (ValueError, TypeError):
        return False


def validate_appointment_data(data):
    """Validate appointment creation/update data"""
    errors = []
    
    if not data.get('customer_name'):
        errors.append('customer_name is required')
    elif len(data.get('customer_name', '')) < 2:
        errors.append('customer_name must be at least 2 characters')
    
    if not data.get('customer_phone'):
        errors.append('customer_phone is required')
    elif not validate_phone(data.get('customer_phone')):
        errors.append('customer_phone is invalid')
    
    if not data.get('service_id'):
        errors.append('service_id is required')
    elif not isinstance(data.get('service_id'), int):
        errors.append('service_id must be an integer')
    
    if not data.get('appointment_date'):
        errors.append('appointment_date is required')
    elif not validate_date(data.get('appointment_date')):
        errors.append('appointment_date must be in YYYY-MM-DD format')
    
    if not data.get('appointment_time'):
        errors.append('appointment_time is required')
    elif not validate_time(data.get('appointment_time')):
        errors.append('appointment_time must be in HH:MM format')
    
    return errors


def validate_service_data(data, is_update=False):
    """Validate service creation/update data"""
    errors = []
    
    if not is_update or 'name' in data:
        if not data.get('name'):
            errors.append('name is required')
        elif len(data.get('name', '')) < 2:
            errors.append('name must be at least 2 characters')
    
    if not is_update or 'duration_minutes' in data:
        if not data.get('duration_minutes'):
            errors.append('duration_minutes is required')
        elif not isinstance(data.get('duration_minutes'), int) or data.get('duration_minutes') <= 0:
            errors.append('duration_minutes must be a positive integer')
    
    if not is_update or 'price' in data:
        if data.get('price') is None:
            errors.append('price is required')
        else:
            try:
                price = float(data.get('price'))
                if price < 0:
                    errors.append('price must be non-negative')
            except (ValueError, TypeError):
                errors.append('price must be a valid number')
    
    return errors


def validate_user_data(data, is_update=False):
    """Validate user registration data"""
    errors = []
    
    if not is_update or 'name' in data:
        if not data.get('name'):
            errors.append('name is required')
        elif len(data.get('name', '')) < 2:
            errors.append('name must be at least 2 characters')
    
    if not is_update or 'email' in data:
        if not data.get('email'):
            errors.append('email is required')
        elif not validate_email(data.get('email')):
            errors.append('email is invalid')
    
    if not is_update or 'password' in data:
        if not data.get('password'):
            errors.append('password is required')
        elif len(data.get('password', '')) < 6:
            errors.append('password must be at least 6 characters')
    
    if not is_update or 'role' in data:
        if not data.get('role'):
            errors.append('role is required')
        elif data.get('role') not in ['admin', 'receptionist']:
            errors.append('role must be either "admin" or "receptionist"')
    
    return errors

