from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import jwt
from app import db
from app.models.user import User
from app.utils.decorators import admin_required, token_required
from app.utils.validators import validate_user_data

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Register a new staff user (admin only, or first user)
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if this is the first user (allow without auth)
    is_first_user = User.query.count() == 0
    
    # If not first user, require admin authentication
    if not is_first_user:
        # Check for token
        token = None
        if 'Authorization' in request.headers:
            try:
                auth_header = request.headers['Authorization']
                token = auth_header.split(' ')[1]
            except IndexError:
                pass
        
        if not token:
            return jsonify({'error': 'Admin authentication required'}), 401
        
        try:
            decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=decoded['user_id']).first()
            if not current_user or not current_user.is_admin():
                return jsonify({'error': 'Admin access required'}), 403
        except:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    # Validate input
    errors = validate_user_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    user = User(
        name=data['name'],
        email=data['email'],
        role=data['role']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': f'User {user.email} registered successfully',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

# Get current user info
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    }), 200
