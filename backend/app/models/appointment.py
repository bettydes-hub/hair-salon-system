"""
Appointment Model
Central table - all bookings
"""
from app import db
from datetime import datetime
import secrets


class Appointment(db.Model):
    __tablename__ = 'appointments'
    __table_args__ = {'extend_existing': True} 
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(120), nullable=True)  # Optional email for notifications
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    created_by = db.Column(db.String(20), nullable=False)  # admin, receptionist, customer, ai
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Payment fields
    reference_number = db.Column(db.String(20), unique=True, nullable=True)  # For clients to track without login
    payment_screenshot_url = db.Column(db.String(255), nullable=True)  # Path to payment screenshot
    payment_amount = db.Column(db.Numeric(10, 2), nullable=True)  # Amount paid
    payment_verification_status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    payment_verified_at = db.Column(db.DateTime, nullable=True)
    payment_verified_by = db.Column(db.String(50), nullable=True)  # 'ai' or user_id of manager/admin
    payment_verification_notes = db.Column(db.Text, nullable=True)  # Notes from AI or manager
    
    def generate_reference_number(self):
        """Generate a unique reference number for the appointment"""
        if not self.reference_number:
            # Format: APT-YYYYMMDD-XXXX (e.g., APT-20240115-A3B2)
            date_str = datetime.utcnow().strftime('%Y%m%d')
            random_str = secrets.token_hex(2).upper()
            self.reference_number = f"APT-{date_str}-{random_str}"
        return self.reference_number
    
    def __repr__(self):
        return f'<Appointment {self.customer_name} - {self.appointment_date} {self.appointment_time}>'

