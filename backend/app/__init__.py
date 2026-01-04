from flask import Flask
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

def create_app():
    app = Flask(__name__)

    # Config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        print("WARNING: DATABASE_URL not set")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Init extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

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

    # Test route
    @app.route('/')
    def index():
        return {'message': 'Hair Salon AI System API is running!', 'status': 'ok'}

    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'database_configured': bool(database_url)}

    return app
