from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

# Create uploads directories if they don't exist
SERVICES_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads', 'services')
PROFILE_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads', 'profiles')
PAYMENT_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads', 'payments')
os.makedirs(SERVICES_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROFILE_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PAYMENT_UPLOAD_FOLDER, exist_ok=True)

def create_app():
    app = Flask(__name__)
    
    # Configure upload folders
    app.config['SERVICES_UPLOAD_FOLDER'] = SERVICES_UPLOAD_FOLDER
    app.config['PROFILE_UPLOAD_FOLDER'] = PROFILE_UPLOAD_FOLDER
    app.config['PAYMENT_UPLOAD_FOLDER'] = PAYMENT_UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        print("WARNING: DATABASE_URL not set")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Init extensions
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Add security headers
    @app.after_request
    def set_security_headers(response):
        """Add security headers to all responses"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        # Remove server header
        response.headers.pop('Server', None)
        return response

    # Import models (for Flask-Migrate)
    from app.models import User, Service, Appointment, WorkingHour


    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.services import services_bp
    from app.routes.appointments import appointments_bp
    from app.routes.working_hours import working_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(working_bp)

    # Serve uploaded images
    @app.route('/uploads/services/<filename>')
    def uploaded_service_file(filename):
        return send_from_directory(app.config['SERVICES_UPLOAD_FOLDER'], filename)
    
    @app.route('/uploads/profiles/<filename>')
    def uploaded_profile_file(filename):
        return send_from_directory(app.config['PROFILE_UPLOAD_FOLDER'], filename)
    
    @app.route('/uploads/payments/<filename>')
    def uploaded_payment_file(filename):
        return send_from_directory(app.config['PAYMENT_UPLOAD_FOLDER'], filename)

    # Test route
    @app.route('/')
    def index():
        return {'message': 'Hair Salon AI System API is running!', 'status': 'ok'}

    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'database_configured': bool(database_url)}

    return app
