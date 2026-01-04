"""
Appointment Business Logic
Handles appointment availability, conflicts, and scheduling
"""
from datetime import datetime, date, time, timedelta
from app import db
from app.models import Appointment, Service, WorkingHour


def check_appointment_conflict(service_id, appointment_date, appointment_time, exclude_id=None):
    """
    Check if an appointment time conflicts with existing appointments
    
    Returns:
        tuple: (has_conflict: bool, conflicting_appointment: Appointment or None)
    """
    service = Service.query.get(service_id)
    if not service:
        return False, None
    
    # Calculate end time
    start_datetime = datetime.combine(appointment_date, appointment_time)
    end_datetime = start_datetime + timedelta(minutes=service.duration_minutes)
    
    # Find overlapping appointments
    query = Appointment.query.filter(
        Appointment.service_id == service_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status != 'cancelled'
    )
    
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    
    existing_appointments = query.all()
    
    for existing in existing_appointments:
        existing_start = datetime.combine(existing.appointment_date, existing.appointment_time)
        existing_service = Service.query.get(existing.service_id)
        existing_end = existing_start + timedelta(minutes=existing_service.duration_minutes)
        
        # Check for overlap
        if (start_datetime < existing_end and end_datetime > existing_start):
            return True, existing
    
    return False, None


def is_within_working_hours(appointment_date, appointment_time, service_duration):
    """
    Check if appointment time is within salon working hours
    
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    # Get day of week
    day_name = appointment_date.strftime('%A')  # Monday, Tuesday, etc.
    
    working_hour = WorkingHour.query.filter_by(day_of_week=day_name).first()
    
    if not working_hour:
        return False, f'No working hours set for {day_name}'
    
    if working_hour.is_closed:
        return False, f'Salon is closed on {day_name}'
    
    # Check if appointment time is within working hours
    appointment_datetime = datetime.combine(appointment_date, appointment_time)
    end_datetime = appointment_datetime + timedelta(minutes=service_duration)
    
    open_datetime = datetime.combine(appointment_date, working_hour.open_time)
    close_datetime = datetime.combine(appointment_date, working_hour.close_time)
    
    if appointment_datetime < open_datetime:
        return False, f'Appointment time is before opening time ({working_hour.open_time})'
    
    if end_datetime > close_datetime:
        return False, f'Appointment would end after closing time ({working_hour.close_time})'
    
    return True, 'Valid'


def get_available_time_slots(date_obj, service_id):
    """
    Get available time slots for a given date and service
    
    Returns:
        list: Available time slots as strings (HH:MM format)
    """
    service = Service.query.get(service_id)
    if not service:
        return []
    
    day_name = date_obj.strftime('%A')
    working_hour = WorkingHour.query.filter_by(day_of_week=day_name).first()
    
    if not working_hour or working_hour.is_closed:
        return []
    
    # Get existing appointments for this date and service
    existing_appointments = Appointment.query.filter(
        Appointment.appointment_date == date_obj,
        Appointment.service_id == service_id,
        Appointment.status != 'cancelled'
    ).all()
    
    # Generate time slots (every 15 minutes)
    slots = []
    current_time = datetime.combine(date_obj, working_hour.open_time)
    close_time = datetime.combine(date_obj, working_hour.close_time)
    
    while current_time + timedelta(minutes=service.duration_minutes) <= close_time:
        slot_time = current_time.time()
        
        # Check if this slot conflicts with existing appointments
        has_conflict, _ = check_appointment_conflict(
            service_id, 
            date_obj, 
            slot_time
        )
        
        if not has_conflict:
            slots.append(slot_time.strftime('%H:%M'))
        
        current_time += timedelta(minutes=15)
    
    return slots


def can_book_appointment(service_id, appointment_date, appointment_time):
    """
    Comprehensive check if an appointment can be booked
    
    Returns:
        tuple: (can_book: bool, message: str)
    """
    service = Service.query.get(service_id)
    if not service:
        return False, 'Service not found'
    
    if not service.is_active:
        return False, 'Service is not available'
    
    # Check working hours
    is_valid, message = is_within_working_hours(
        appointment_date, 
        appointment_time, 
        service.duration_minutes
    )
    if not is_valid:
        return False, message
    
    # Check conflicts
    has_conflict, conflicting = check_appointment_conflict(
        service_id, 
        appointment_date, 
        appointment_time
    )
    if has_conflict:
        return False, f'Time slot is already booked'
    
    # Check if appointment is in the past
    appointment_datetime = datetime.combine(appointment_date, appointment_time)
    if appointment_datetime < datetime.now():
        return False, 'Cannot book appointments in the past'
    
    return True, 'Available'

