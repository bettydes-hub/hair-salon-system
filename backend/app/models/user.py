from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}  # Prevent "table already defined"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'manager', 'receptionist', or 'client'
    profile_photo_url = db.Column(db.String(255), nullable=True)  # Path to profile photo
    must_change_password = db.Column(db.Boolean, default=True, nullable=False)  # Force password change on first login
    email_verified = db.Column(db.Boolean, nullable=False, server_default='false')  # Email verification status
    verification_code = db.Column(db.String(10), nullable=True)
    verification_expires_at = db.Column(db.DateTime, nullable=True)
    reset_code = db.Column(db.String(10), nullable=True)
    reset_expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == 'admin'

    def is_manager(self):
        return self.role == 'manager'

    def is_receptionist(self):
        return self.role == 'receptionist'

    def is_client(self):
        return self.role == 'client'

    def is_staff(self):
        """Check if user is staff (admin, manager, or receptionist)"""
        return self.role in ['admin', 'manager', 'receptionist']

    def __repr__(self):
        return f'<User {self.email} - {self.role}>'
