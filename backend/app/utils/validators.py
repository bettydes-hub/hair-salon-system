"""
Input Validation Utilities
Validate request data before processing
"""
from datetime import datetime, date, time
from flask import jsonify
import re
from app.utils.security import validate_email_strict, sanitize_input


def validate_email(email):
    """Validate email format (strict)"""
    if not email:
        return False
    return validate_email_strict(email)


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


def validate_user_data(data, is_update=False, is_admin_creation=False):
    """Validate user registration data
    
    Args:
        data: User data dictionary
        is_update: Whether this is an update operation
        is_admin_creation: Whether admin is creating user (password optional, will be set to default)
    """
    from app.utils.security import validate_password_strength, sanitize_input
    
    errors = []
    
    if not is_update or 'name' in data:
        name = data.get('name', '').strip()
        if not name:
            errors.append('name is required')
        elif len(name) < 2:
            errors.append('name must be at least 2 characters')
        elif len(name) > 100:
            errors.append('name must be less than 100 characters')
        else:
            # Sanitize name
            sanitized_name = sanitize_input(name, max_length=100)
            if sanitized_name != name:
                errors.append('name contains invalid characters')
    
    if not is_update or 'email' in data:
        email = data.get('email', '').strip().lower()
        if not email:
            errors.append('email is required')
        elif not validate_email(email):
            errors.append('email is invalid')
        elif len(email) > 120:
            errors.append('email must be less than 120 characters')
    
    # Password validation: required unless admin is creating user
    if not is_update or 'password' in data:
        if not is_admin_creation:  # Regular registration or update requires password
            password = data.get('password', '')
            if not password:
                errors.append('password is required')
            else:
                # Validate password strength
                is_valid, password_errors = validate_password_strength(password)
                if not is_valid:
                    errors.extend(password_errors)
        # If admin creation, password is optional (will use default)
    
    if not is_update or 'role' in data:
        role = data.get('role', '').lower()
        if not role:
            errors.append('role is required')
        else:
            # When admin creates users, only staff roles are allowed (clients don't need accounts)
            if is_admin_creation:
                if role not in ['admin', 'manager', 'receptionist']:
                    errors.append('role must be one of: "admin", "manager", or "receptionist" (clients use the public website and do not need accounts)')
            else:
                # For regular registration, allow all roles (though client registration is unlikely)
                if role not in ['admin', 'manager', 'receptionist', 'client']:
                    errors.append('role must be one of: "admin", "manager", "receptionist", or "client"')
    
    return errors

