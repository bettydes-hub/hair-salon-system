"""
Flask Application Factory
This is where you'll initialize your Flask app
"""
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("WARNING: DATABASE_URL not set in .env file")
        print("   The app will start but database features won't work.")
        print("   Create a .env file with your PostgreSQL connection string.")
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    CORS(app)  # Enable CORS for frontend
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models so Flask-Migrate can detect them
    from app.models import User, Service, Appointment, WorkingHour
    
    # Register blueprints (you'll create these)
    # from app.routes.auth import auth_bp
    # app.register_blueprint(auth_bp)
    
    # Test route (remove this later)
    @app.route('/')
    def index():
        return {'message': 'Hair Salon AI System API is running!', 'status': 'ok'}
    
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'database_configured': bool(database_url)}
    
    return app

