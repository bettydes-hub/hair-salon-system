"""
Authentication Decorators
Protect routes with JWT tokens and role-based access control
"""
from functools import wraps
from flask import jsonify, request, current_app
import jwt
from app.models.user import User


def token_required(f):
    """Require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Format: "Bearer <token>"
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            
            # Check if password change is required (for staff only, exclude change-password route)
            if (current_user.must_change_password and 
                current_user.is_staff() and 
                request.endpoint != 'auth.change_password'):
                return jsonify({
                    'error': 'Password change required',
                    'must_change_password': True
                }), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Token validation failed'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


def admin_required(f):
    """Require admin role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def manager_required(f):
    """Require manager role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_manager():
            return jsonify({'error': 'Manager access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def manager_or_admin_required(f):
    """Require manager or admin role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not (current_user.is_manager() or current_user.is_admin()):
            return jsonify({'error': 'Manager or admin access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def receptionist_or_admin_required(f):
    """Require receptionist or admin role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not (current_user.is_receptionist() or current_user.is_admin()):
            return jsonify({'error': 'Access denied. Receptionist or admin required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def staff_required(f):
    """Require staff role (admin, manager, or receptionist)"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_staff():
            return jsonify({'error': 'Staff access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

