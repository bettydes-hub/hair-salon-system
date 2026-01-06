from flask import Blueprint, request, jsonify
from app import db
from app.models import WorkingHour
from app.utils.decorators import manager_or_admin_required
from datetime import datetime
from sqlalchemy import case

working_bp = Blueprint('working_hours', __name__, url_prefix='/api/working-hours')

# Initialize working hours (create all 7 days if they don't exist)
@working_bp.route('/initialize', methods=['POST'])
@manager_or_admin_required
def initialize_hours(current_user):
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    created_count = 0
    
    for day in days:
        # Check if day already exists
        existing = WorkingHour.query.filter_by(day_of_week=day).first()
        if not existing:
            # Create default working hours: 9:00 AM to 6:00 PM, closed on Sunday
            default_open = datetime.strptime('09:00', '%H:%M').time()
            default_close = datetime.strptime('18:00', '%H:%M').time()
            is_closed = (day == 'Sunday')
            
            new_hour = WorkingHour(
                day_of_week=day,
                open_time=default_open,
                close_time=default_close,
                is_closed=is_closed
            )
            db.session.add(new_hour)
            created_count += 1
    
    if created_count > 0:
        db.session.commit()
        return jsonify({
            'message': f'Initialized {created_count} working hour records',
            'created': created_count
        }), 201
    else:
        return jsonify({
            'message': 'All working hours already exist',
            'created': 0
        }), 200

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

# Update working hours (manager or admin only)
@working_bp.route('/<int:id>', methods=['PUT'])
@manager_or_admin_required
def update_hours(current_user, id):
    h = WorkingHour.query.get_or_404(id)
    data = request.json
    
    # Handle is_closed
    if 'is_closed' in data:
        h.is_closed = bool(data['is_closed'])
    
    # Update times if provided (even if closed, we keep times in DB)
    if 'open_time' in data and data.get('open_time'):
        try:
            h.open_time = datetime.strptime(data['open_time'], '%H:%M').time()
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid open_time format. Use HH:MM'}), 400
    
    if 'close_time' in data and data.get('close_time'):
        try:
            h.close_time = datetime.strptime(data['close_time'], '%H:%M').time()
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid close_time format. Use HH:MM'}), 400
    
    # Validate that close time is after open time (only if not closed)
    if not h.is_closed and h.open_time and h.close_time:
        if h.open_time >= h.close_time:
            return jsonify({'error': 'Close time must be after open time'}), 400
    
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
