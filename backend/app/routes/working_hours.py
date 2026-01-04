from flask import Blueprint, request, jsonify
from app import db
from app.models import WorkingHour
from app.utils.decorators import admin_required
from datetime import datetime
from sqlalchemy import case

working_bp = Blueprint('working_hours', __name__, url_prefix='/api/working-hours')

# List all working hours (public)
@working_bp.route('/', methods=['GET'])
def list_hours():
    hours = WorkingHour.query.order_by(
        case(
            (WorkingHour.day_of_week == 'Monday', 1),
            (WorkingHour.day_of_week == 'Tuesday', 2),
            (WorkingHour.day_of_week == 'Wednesday', 3),
            (WorkingHour.day_of_week == 'Thursday', 4),
            (WorkingHour.day_of_week == 'Friday', 5),
            (WorkingHour.day_of_week == 'Saturday', 6),
            (WorkingHour.day_of_week == 'Sunday', 7),
            else_=8
        )
    ).all()
    
    return jsonify([{
        'id': h.id,
        'day_of_week': h.day_of_week,
        'open_time': str(h.open_time),
        'close_time': str(h.close_time),
        'is_closed': h.is_closed
    } for h in hours])

# Get single day working hours
@working_bp.route('/<int:id>', methods=['GET'])
def get_hours(id):
    hours = WorkingHour.query.get_or_404(id)
    return jsonify({
        'id': hours.id,
        'day_of_week': hours.day_of_week,
        'open_time': str(hours.open_time),
        'close_time': str(hours.close_time),
        'is_closed': hours.is_closed
    })

# Update working hours (admin only)
@working_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_hours(current_user, id):
    h = WorkingHour.query.get_or_404(id)
    data = request.json
    
    if 'open_time' in data:
        try:
            h.open_time = datetime.strptime(data['open_time'], '%H:%M').time()
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
    
    if 'close_time' in data:
        try:
            h.close_time = datetime.strptime(data['close_time'], '%H:%M').time()
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
    
    if 'is_closed' in data:
        h.is_closed = bool(data['is_closed'])
    
    db.session.commit()
    
    return jsonify({
        'message': f'Working hours for {h.day_of_week} updated',
        'working_hours': {
            'id': h.id,
            'day_of_week': h.day_of_week,
            'open_time': str(h.open_time),
            'close_time': str(h.close_time),
            'is_closed': h.is_closed
        }
    })
