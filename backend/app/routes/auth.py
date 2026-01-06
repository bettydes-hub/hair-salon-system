from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import jwt
import secrets
from app import db
from app.models.user import User
from app.utils.decorators import admin_required, token_required
from app.utils.validators import validate_user_data
from app.utils.rate_limiter import rate_limit
from app.utils.security import sanitize_input
from app.utils.email_utils import send_email, build_verification_email, build_password_reset_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def generate_code(length=6):
    """Generate a random numeric code"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])

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
    
    # Sanitize inputs
    if 'name' in data:
        data['name'] = sanitize_input(data['name'], max_length=100)
    if 'email' in data:
        data['email'] = sanitize_input(data['email'], max_length=120).lower()
    
    # Validate input (password optional for admin creation)
    errors = validate_user_data(data, is_admin_creation=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    # Check if email already exists (after sanitization)
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Set default password if not provided (admin creation)
    default_password = data.get('password', 'changeme')
    
    # Generate verification code
    verification_code = generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    user = User(
        name=data['name'],
        email=data['email'],
        role=data['role'],
        must_change_password=True,  # Force password change on first login
        email_verified=False,
        verification_code=verification_code,
        verification_expires_at=expires_at
    )
    user.set_password(default_password)
    db.session.add(user)
    db.session.commit()

    # Send verification email
    email_sent = False
    email_error = None
    try:
        email_payload = build_verification_email(user.name, verification_code)
        send_email(user.email, email_payload["subject"], email_payload["html_body"], email_payload["text_body"])
        email_sent = True
    except Exception as e:
        email_error = str(e)
        print(f"[EMAIL ERROR] Failed to send verification email to {user.email}: {e}")
        # Don't block user creation, but log the error

    return jsonify({
        'message': f'User {user.email} registered successfully' + ('' if email_sent else '. Verification email could not be sent - check SMTP configuration.'),
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'email_verified': user.email_verified
        },
        'email_sent': email_sent,
        'email_error': email_error if not email_sent else None
    }), 201

# Login route with rate limiting
@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)  # 5 attempts per 5 minutes
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Sanitize email input
    email = sanitize_input(data.get('email', '').strip().lower(), max_length=120)
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    # Always return same error message to prevent user enumeration
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Require email verification for staff accounts
    if not user.email_verified:
        return jsonify({
            'error': 'Email not verified. Please enter the verification code sent to your email.',
            'email_verified': False,
            'must_verify': True
        }), 403
    
    # Check if password change is required (for staff only, not clients)
    if user.must_change_password and user.is_staff():
        # Generate JWT token with must_change_password flag
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'must_change_password': True,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Password change required',
            'token': token,
            'must_change_password': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 200
    
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
            'role': user.role,
            'email_verified': user.email_verified
        }
    }), 200

# Verify email with code
@auth_bp.route('/verify-email', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)
def verify_email():
    data = request.get_json()
    email = sanitize_input(data.get('email', '').strip().lower(), max_length=120) if data.get('email') else None
    code = data.get('code', '').strip()

    if not email or not code:
        return jsonify({'error': 'Email and verification code are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid email or code'}), 400

    if user.email_verified:
        return jsonify({'message': 'Email already verified'}), 200

    if not user.verification_code or user.verification_code != code:
        return jsonify({'error': 'Invalid verification code'}), 400

    if user.verification_expires_at and user.verification_expires_at < datetime.utcnow():
        return jsonify({'error': 'Verification code has expired. Please request a new one.'}), 400

    user.email_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully'}), 200

# Resend verification code
@auth_bp.route('/resend-verification', methods=['POST'])
@rate_limit(max_requests=3, window_seconds=300)
def resend_verification():
    data = request.get_json()
    email = sanitize_input(data.get('email', '').strip().lower(), max_length=120) if data.get('email') else None

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If that email exists, a verification code has been sent'}), 200

    if user.email_verified:
        return jsonify({'message': 'Email already verified'}), 200

    code = generate_code()
    user.verification_code = code
    user.verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    try:
        payload = build_verification_email(user.name, code)
        send_email(user.email, payload["subject"], payload["html_body"], payload["text_body"])
    except Exception as e:
        print(f"[EMAIL] Failed to resend verification email: {e}")
        return jsonify({'error': 'Could not send verification email. Please check email configuration.'}), 500

    return jsonify({'message': 'Verification code sent to your email'}), 200

# Request password reset
@auth_bp.route('/request-password-reset', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)
def request_password_reset():
    data = request.get_json()
    email = sanitize_input(data.get('email', '').strip().lower(), max_length=120) if data.get('email') else None

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Do not reveal whether the email exists
        return jsonify({'message': 'If that email exists, a reset code has been sent'}), 200

    code = generate_code()
    user.reset_code = code
    user.reset_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    try:
        payload = build_password_reset_email(user.name, code)
        send_email(user.email, payload["subject"], payload["html_body"], payload["text_body"])
    except Exception as e:
        print(f"[EMAIL] Failed to send password reset email: {e}")
        return jsonify({'error': 'Could not send password reset email. Please check email configuration.'}), 500

    return jsonify({'message': 'If that email exists, a reset code has been sent'}), 200

# Reset password with code
@auth_bp.route('/reset-password', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)
def reset_password_with_code():
    data = request.get_json()
    email = sanitize_input(data.get('email', '').strip().lower(), max_length=120) if data.get('email') else None
    code = data.get('code', '').strip()
    new_password = data.get('new_password', '')

    if not email or not code or not new_password:
        return jsonify({'error': 'Email, code, and new password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.reset_code or user.reset_code != code:
        return jsonify({'error': 'Invalid reset code or email'}), 400

    if user.reset_expires_at and user.reset_expires_at < datetime.utcnow():
        return jsonify({'error': 'Reset code has expired. Please request a new one.'}), 400

    # Validate new password strength
    from app.utils.security import validate_password_strength
    is_valid, password_errors = validate_password_strength(new_password)
    if not is_valid:
        return jsonify({'error': 'Password validation failed', 'details': password_errors}), 400

    user.set_password(new_password)
    user.reset_code = None
    user.reset_expires_at = None
    user.must_change_password = False
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200

# Test email configuration (admin only)
@auth_bp.route('/test-email', methods=['POST'])
@admin_required
def test_email(current_user):
    """Test email configuration by sending a test email"""
    data = request.get_json()
    test_email = data.get('email', current_user.email)
    
    if not test_email:
        return jsonify({'error': 'Email address is required'}), 400
    
    try:
        from app.utils.email_utils import SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL
        
        missing = []
        if not SMTP_HOST:
            missing.append('SMTP_HOST')
        if not SMTP_PORT:
            missing.append('SMTP_PORT')
        if not SMTP_USERNAME:
            missing.append('SMTP_USERNAME')
        if not SMTP_PASSWORD:
            missing.append('SMTP_PASSWORD')
        if not FROM_EMAIL:
            missing.append('FROM_EMAIL')
        
        if missing:
            return jsonify({
                'error': 'SMTP not configured',
                'missing': missing,
                'message': f'Please set these environment variables in your .env file: {", ".join(missing)}'
            }), 400
        
        # Send test email
        code = "123456"  # Test code
        email_payload = build_verification_email("Test User", code)
        send_email(test_email, email_payload["subject"], email_payload["html_body"], email_payload["text_body"])
        
        return jsonify({
            'message': f'Test email sent successfully to {test_email}. Check your inbox (and spam folder).',
            'smtp_config': {
                'host': SMTP_HOST,
                'port': SMTP_PORT,
                'username': SMTP_USERNAME,
                'from_email': FROM_EMAIL,
                'password_configured': bool(SMTP_PASSWORD)
            }
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        return jsonify({
            'error': 'Failed to send test email',
            'details': error_msg,
            'troubleshooting': {
                'check_app_password': 'Make sure you created a Gmail App Password (not your regular password)',
                'check_env_file': 'Verify your .env file has SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL',
                'check_2fa': 'Ensure 2-Step Verification is enabled on your Gmail account',
                'check_firewall': 'Make sure your firewall allows connections to smtp.gmail.com:465',
                'check_backend_logs': 'Check the backend console for detailed error messages'
            }
        }), 500

# Get current user info
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role,
        'profile_photo_url': current_user.profile_photo_url,
        'must_change_password': current_user.must_change_password if current_user.is_staff() else False,
        'email_verified': current_user.email_verified,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    }), 200
