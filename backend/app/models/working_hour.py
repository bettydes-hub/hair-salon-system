"""
Working Hours Model
Defines salon availability
"""
from app import db


class WorkingHour(db.Model):
    __tablename__ = 'working_hours'
    __table_args__ = {'extend_existing': True} 
    
    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.String(20), nullable=False)  # Monday, Tuesday, etc.
    open_time = db.Column(db.Time, nullable=False)
    close_time = db.Column(db.Time, nullable=False)
    is_closed = db.Column(db.Boolean, default=False)  # True if salon is closed that day
    
    def __repr__(self):
        if self.is_closed:
            return f'<WorkingHour {self.day_of_week} - CLOSED>'
        return f'<WorkingHour {self.day_of_week} - {self.open_time} to {self.close_time}>'

