import axios from 'axios'

// Base URL for API - uses proxy from vite.config.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('must_change_password')
      window.location.href = '/login'
    } else if (error.response?.status === 403 && error.response?.data?.must_change_password) {
      // Password change required - but only set if not already cleared
      // This prevents re-setting the flag after a successful password change
      const currentFlag = localStorage.getItem('must_change_password')
      if (currentFlag !== 'false') {
        localStorage.setItem('must_change_password', 'true')
      }
      // Don't redirect, let the App component handle showing the modal
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email, password) => {
    // Clear any old user data first to prevent stale data issues
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('must_change_password')
    
    const response = await api.post('/api/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Store must_change_password flag if present
      if (response.data.must_change_password) {
        localStorage.setItem('must_change_password', 'true')
      } else {
        localStorage.removeItem('must_change_password')
      }
    }
    return response.data
  },

  // Register (admin only)
  register: async (name, email, password, role) => {
    const data = { name, email, role }
    // Only include password if provided (for admin creation, password is optional)
    if (password) {
      data.password = password
    }
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/api/auth/change-password', passwordData)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // Upload profile photo
  uploadProfilePhoto: async (photoFile) => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    const response = await api.post('/api/auth/upload-profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData)
    return response.data
  },

  // Logout (just clear local storage)
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
}

// ==================== USERS API (Admin Only) ====================

export const usersAPI = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await api.get('/api/auth/users')
    return response.data
  },

  // Get single user (admin only)
  getById: async (id) => {
    const response = await api.get(`/api/auth/users/${id}`)
    return response.data
  },

  // Update user (admin only)
  update: async (id, userData) => {
    const response = await api.put(`/api/auth/users/${id}`, userData)
    return response.data
  },

  // Delete user (admin only)
  delete: async (id) => {
    const response = await api.delete(`/api/auth/users/${id}`)
    return response.data
  },
}

// ==================== SERVICES API ====================

export const servicesAPI = {
  // Get all active services
  getAll: async () => {
    const response = await api.get('/api/services/')
    return response.data
  },

  // Get single service
  getById: async (id) => {
    const response = await api.get(`/api/services/${id}`)
    return response.data
  },

  // Create service (admin only)
  create: async (serviceData) => {
    const response = await api.post('/api/services/', serviceData)
    return response.data
  },

  // Update service (admin only)
  update: async (id, serviceData) => {
    const response = await api.put(`/api/services/${id}`, serviceData)
    return response.data
  },

  // Delete/deactivate service (admin only)
  delete: async (id) => {
    const response = await api.delete(`/api/services/${id}`)
    return response.data
  },

  // Upload service image (admin/manager only)
  uploadImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await api.post('/api/services/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// ==================== APPOINTMENTS API ====================

export const appointmentsAPI = {
  // Get all appointments (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.date) params.append('date', filters.date)
    if (filters.service_id) params.append('service_id', filters.service_id)

    const queryString = params.toString()
    const url = `/api/appointments/${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data
  },

  // Get single appointment
  getById: async (id) => {
    const response = await api.get(`/api/appointments/${id}`)
    return response.data
  },

  // Create appointment (public - no auth required)
  create: async (appointmentData) => {
    const response = await api.post('/api/appointments/', appointmentData)
    return response.data
  },

  // Update appointment
  update: async (id, appointmentData) => {
    const response = await api.put(`/api/appointments/${id}`, appointmentData)
    return response.data
  },

  // Update appointment status
  updateStatus: async (id, status) => {
    const response = await api.put(`/api/appointments/${id}/status`, { status })
    return response.data
  },

  // Delete appointment
  delete: async (id) => {
    const response = await api.delete(`/api/appointments/${id}`)
    return response.data
  },

  // Get available time slots
  getAvailableSlots: async (date, serviceId) => {
    const response = await api.get('/api/appointments/available-slots', {
      params: { date, service_id: serviceId },
    })
    return response.data
  },

  // Get appointment by reference number (public - no auth required)
  getByReference: async (referenceNumber) => {
    const response = await api.get(`/api/appointments/reference/${referenceNumber}`)
    return response.data
  },

  // Upload payment screenshot (public - no auth required)
  uploadPayment: async (appointmentId, paymentFile, paymentAmount) => {
    const formData = new FormData()
    formData.append('payment_screenshot', paymentFile)
    if (paymentAmount) {
      formData.append('payment_amount', paymentAmount)
    }
    const response = await api.post(`/api/appointments/${appointmentId}/upload-payment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // AI verify payment (public - triggers AI verification)
  aiVerifyPayment: async (appointmentId) => {
    const response = await api.post(`/api/appointments/${appointmentId}/ai-verify`)
    return response.data
  },
}

// ==================== WORKING HOURS API ====================

export const workingHoursAPI = {
  // Get all working hours
  getAll: async () => {
    const response = await api.get('/api/working-hours/')
    return response.data
  },

  // Get single day
  getById: async (id) => {
    const response = await api.get(`/api/working-hours/${id}`)
    return response.data
  },

  // Initialize working hours (create all 7 days with defaults)
  initialize: async () => {
    const response = await api.post('/api/working-hours/initialize')
    return response.data
  },

  // Update working hours (admin only)
  update: async (id, workingHoursData) => {
    const response = await api.put(`/api/working-hours/${id}`, workingHoursData)
    return response.data
  },
}

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  check: async () => {
    const response = await api.get('/api/health')
    return response.data
  },
}

export default api

