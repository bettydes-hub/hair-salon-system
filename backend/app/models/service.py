"""
Service Model
Services offered by the salon
"""
from app import db


class Service(db.Model):
    __tablename__ = 'services'
    __table_args__ = {'extend_existing': True} 
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=True)  # Service category
    image_url = db.Column(db.String(255), nullable=True)  # Path to service image
    duration_minutes = db.Column(db.Integer, nullable=False)  # Time in minutes
    price = db.Column(db.Numeric(10, 2), nullable=False)  # DECIMAL(10,2)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship: One service can have many appointments
    appointments = db.relationship('Appointment', backref='service', lazy=True)
    
    def __repr__(self):
        return f'<Service {self.name} - ${self.price}>'

