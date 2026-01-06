// API Constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Appointment Statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTIONIST: 'receptionist',
  CLIENT: 'client',
}

// Days of Week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// Service Categories
export const SERVICE_CATEGORIES = [
  '💇 Hair Services',
  '💅 Nail Services',
  '💄 Makeup Services',
  '🧖‍♀️ Skin & Facial Care',
  '👁️ Eyebrows & Eyelashes',
  '✨ Hair Removal',
  '👰 Bridal Packages',
  '👧 Kids Services',
  '🎁 Packages & Offers',
]

