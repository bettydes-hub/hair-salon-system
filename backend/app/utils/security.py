"""
Security Utilities
Password validation, input sanitization, and security helpers
"""
import re
import hashlib
from werkzeug.utils import secure_filename
import os

# Optional PIL import for image validation
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


def validate_password_strength(password):
    """
    Validate password strength
    Returns: (is_valid, errors_list)
    """
    errors = []
    
    if len(password) < 8:
        errors.append('Password must be at least 8 characters long')
    
    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter')
    
    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter')
    
    if not re.search(r'\d', password):
        errors.append('Password must contain at least one number')
    
    # Check for common weak passwords
    common_passwords = ['password', '12345678', 'changeme', 'admin', 'qwerty']
    if password.lower() in common_passwords:
        errors.append('Password is too common. Please choose a stronger password')
    
    return len(errors) == 0, errors


def sanitize_input(text, max_length=None):
    """
    Sanitize user input to prevent XSS attacks
    """
    if not text:
        return text
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Remove script tags and event handlers (basic XSS prevention)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    # Limit length if specified
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text.strip()


def validate_email_strict(email):
    """
    Strict email validation using regex
    """
    if not email:
        return False
    
    # RFC 5322 compliant email regex (simplified)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_file_type(file, allowed_extensions, allowed_mime_types=None):
    """
    Validate file type by extension and optionally MIME type
    Returns: (is_valid, error_message)
    """
    if not file or not file.filename:
        return False, 'No file provided'
    
    filename = secure_filename(file.filename)
    
    # Check extension
    if '.' not in filename:
        return False, 'File must have an extension'
    
    ext = filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_extensions:
        return False, f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
    
    # Check MIME type if provided
    if allowed_mime_types and hasattr(file, 'content_type'):
        if file.content_type not in allowed_mime_types:
            return False, f'Invalid file MIME type. Allowed: {", ".join(allowed_mime_types)}'
    
    return True, None


def validate_image_file(file_path):
    """
    Validate that uploaded file is actually a valid image
    Returns: (is_valid, error_message)
    """
    if not PIL_AVAILABLE:
        # If PIL is not available, skip validation
        return True, None
    
    try:
        with Image.open(file_path) as img:
            img.verify()  # Verify it's a valid image
        return True, None
    except Exception as e:
        return False, f'Invalid image file: {str(e)}'


def generate_secure_filename(original_filename, prefix=''):
    """
    Generate a secure, unique filename
    """
    import secrets
    import uuid
    
    # Get extension
    if '.' in original_filename:
        ext = original_filename.rsplit('.', 1)[1].lower()
    else:
        ext = ''
    
    # Generate unique name
    unique_id = secrets.token_hex(8)
    if prefix:
        secure_name = f"{prefix}_{unique_id}.{ext}" if ext else f"{prefix}_{unique_id}"
    else:
        secure_name = f"{uuid.uuid4()}.{ext}" if ext else str(uuid.uuid4())
    
    return secure_filename(secure_name)


def hash_sensitive_data(data):
    """
    Hash sensitive data for logging (not for passwords - use werkzeug for that)
    """
    return hashlib.sha256(str(data).encode()).hexdigest()[:16]


def is_safe_path(basedir, path):
    """
    Check if path is safe (prevents directory traversal)
    """
    # Resolve the real path
    real_basedir = os.path.realpath(basedir)
    real_path = os.path.realpath(path)
    
    # Check if the resolved path starts with the base directory
    return real_path.startswith(real_basedir)

