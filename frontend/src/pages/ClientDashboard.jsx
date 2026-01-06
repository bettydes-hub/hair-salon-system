import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, appointmentsAPI, servicesAPI } from '../services/api'
import { getUser } from '../utils/auth'
import NavigationBar from '../components/NavigationBar'
import { formatDateDisplay } from '../utils/helpers'
import { API_URL } from '../utils/constants'

function ClientDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const currentUser = getUser()
      if (!currentUser) {
        navigate('/login')
        return
      }
      setUser(currentUser)

      // Get user info from API
      const userData = await authAPI.getCurrentUser()
      setUser(userData)

      // Get client's appointments and available services
      const [myAppointments, availableServices] = await Promise.all([
        appointmentsAPI.getAll(),
        servicesAPI.getAll(),
      ])

      setAppointments(myAppointments)
      setServices(availableServices)

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = myAppointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_date)
        return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
      })

      const completed = myAppointments.filter((apt) => apt.status === 'completed')
      const pending = myAppointments.filter((apt) => apt.status === 'pending')

      setStats({
        totalAppointments: myAppointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        pendingAppointments: pending.length,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.appointment_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      return dateA - dateB
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
      <NavigationBar />
      
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Welcome Section with Animation */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome, <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{user?.name || user?.email}</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">Manage your appointments and discover our services</p>
        </div>

        {/* Stats Cards with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-pink-100 text-xs sm:text-sm font-medium mb-2">
                  Total Appointments
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.totalAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-100 text-xs sm:text-sm font-medium mb-2">
                  Upcoming
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.upcomingAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-100 text-xs sm:text-sm font-medium mb-2">
                  Completed
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.completedAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-yellow-100 text-xs sm:text-sm font-medium mb-2">
                  Pending
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.pendingAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div
            onClick={() => navigate('/appointments/new')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Book Appointment</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">+</p>
            <p className="text-xs md:text-sm text-gray-500">Schedule a new service →</p>
          </div>

          <div
            onClick={() => navigate('/appointments')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">My Appointments</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stats.totalAppointments}</p>
            <p className="text-xs md:text-sm text-gray-500">View all my bookings →</p>
          </div>

          <div
            onClick={() => navigate('/services-gallery')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Services</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{services.length}</p>
            <p className="text-xs md:text-sm text-gray-500">Browse all services →</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 md:mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <button
                onClick={() => navigate('/appointments')}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {apt.service_name || 'Service'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(apt.appointment_date)} at {apt.appointment_time?.substring(0, 5)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 md:mb-8 animate-fade-in text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
            <p className="text-gray-500 mb-4">Book your first appointment to get started!</p>
            <button
              onClick={() => navigate('/appointments/new')}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-medium"
            >
              Book Now
            </button>
          </div>
        )}

        {/* Services Preview */}
        {services.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Available Services</h2>
              <button
                onClick={() => navigate('/services-gallery')}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service) => (
                <div
                  key={service.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => navigate('/services-gallery')}
                >
                  {service.image_url && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img
                        src={`${API_URL}${service.image_url}`}
                        alt={service.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {service.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {service.duration_minutes} min
                    </span>
                    <span className="font-bold text-pink-600">
                      ${service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default ClientDashboard
