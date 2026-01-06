"""
Rate Limiting Utilities
Prevent brute force attacks and abuse
"""
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timedelta
from collections import defaultdict
import time


# In-memory rate limit storage (use Redis in production)
_rate_limit_store = defaultdict(list)


def rate_limit(max_requests=5, window_seconds=60, key_func=None):
    """
    Rate limiting decorator
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        key_func: Function to generate rate limit key (default: IP address)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate rate limit key
            if key_func:
                key = key_func()
            else:
                # Default: use IP address
                key = request.remote_addr or 'unknown'
            
            # Add endpoint to key for per-endpoint limiting
            endpoint_key = f"{key}:{request.endpoint}"
            
            # Clean old entries
            current_time = time.time()
            _rate_limit_store[endpoint_key] = [
                timestamp for timestamp in _rate_limit_store[endpoint_key]
                if current_time - timestamp < window_seconds
            ]
            
            # Check rate limit
            if len(_rate_limit_store[endpoint_key]) >= max_requests:
                return jsonify({
                    'error': 'Too many requests. Please try again later.',
                    'retry_after': window_seconds
                }), 429
            
            # Add current request
            _rate_limit_store[endpoint_key].append(current_time)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def get_client_ip():
    """Get client IP address, handling proxies"""
    if request.headers.get('X-Forwarded-For'):
        # Get first IP in X-Forwarded-For header
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr or 'unknown'

