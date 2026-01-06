// Helper utility functions

// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format time to HH:MM
export const formatTime = (time) => {
  if (!time) return ''
  if (typeof time === 'string') {
    return time.substring(0, 5) // Get HH:MM from HH:MM:SS
  }
  return time
}

// Format date for display (e.g., "Jan 15, 2024")
export const formatDateDisplay = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Get today's date in YYYY-MM-DD format
export const getToday = () => {
  return formatDate(new Date())
}

// Get date X days from today
export const getDateFromToday = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate phone (at least 10 digits)
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10
}

// Handle API errors with user-friendly messages
export const getErrorMessage = (error) => {
  // Network errors (backend not running, CORS, connection refused)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request took too long. Please check your internet connection and try again.'
    }
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      return 'Cannot connect to the server. Please make sure the backend server is running on http://localhost:5000'
    }
    return 'Connection error. Please check your internet connection and try again.'
  }
  
  // HTTP errors with response
  const status = error.response?.status
  const data = error.response?.data
  
  // Handle validation errors with details
  if (data?.details) {
    const details = Array.isArray(data.details) ? data.details : [data.details]
    return details.map(detail => {
      // Make validation messages more user-friendly
      if (typeof detail === 'string') {
        // Capitalize first letter and add period if missing
        return detail.charAt(0).toUpperCase() + detail.slice(1) + (detail.endsWith('.') ? '' : '.')
      }
      return detail
    }).join(' ')
  }
  
  // Handle specific error messages from backend
  if (data?.error) {
    let message = data.error
    
    // Make common error messages more user-friendly
    if (message.includes('Invalid email or password')) {
      return 'The email or password you entered is incorrect. Please try again.'
    }
    if (message.includes('Token has expired')) {
      return 'Your session has expired. Please log in again.'
    }
    if (message.includes('Token is missing') || message.includes('Invalid token')) {
      return 'You are not logged in. Please log in to continue.'
    }
    if (message.includes('Admin access required') || message.includes('Admin authentication required')) {
      return 'You need administrator privileges to perform this action.'
    }
    if (message.includes('Manager or admin access required')) {
      return 'You need manager or administrator privileges to perform this action.'
    }
    if (message.includes('Password change required')) {
      return 'You must change your password before continuing.'
    }
    if (message.includes('Email already exists')) {
      return 'This email address is already registered. Please use a different email.'
    }
    if (message.includes('Invalid file type')) {
      return 'The file type is not supported. Please upload a valid file format.'
    }
    if (message.includes('File size must be less than')) {
      return message // Keep file size messages as-is
    }
    if (message.includes('Validation failed')) {
      return 'Please check your input and try again. Some fields may be missing or invalid.'
    }
    if (message.includes('Too many requests')) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    
    return message
  }
  
  // Status code specific messages
  if (status === 400) {
    return 'Invalid request. Please check your input and try again.'
  }
  if (status === 401) {
    return 'You are not authorized. Please log in and try again.'
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }
  if (status === 404) {
    return 'The requested resource was not found. It may have been deleted or moved.'
  }
  if (status === 409) {
    return 'This action conflicts with existing data. Please check and try again.'
  }
  if (status === 422) {
    return 'The information you provided is invalid. Please check all fields and try again.'
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.'
  }
  if (status === 500) {
    return 'A server error occurred. Our team has been notified. Please try again later.'
  }
  if (status === 503) {
    return 'The service is temporarily unavailable. Please try again in a few moments.'
  }
  
  return error.message || 'An unexpected error occurred. Please try again.'
}

