import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, appointmentsAPI } from '../services/api'
import { getUser } from '../utils/auth'
import NavigationBar from '../components/NavigationBar'

function ReceptionistDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
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

      // Get today's appointments
      const today = new Date().toISOString().split('T')[0]
      const appointments = await appointmentsAPI.getAll({ date: today })
      
      const pendingApps = appointments.filter((apt) => apt.status === 'pending')
      const confirmedApps = appointments.filter((apt) => apt.status === 'confirmed')
      const completedApps = appointments.filter((apt) => apt.status === 'completed')

      // Get upcoming appointments (next 7 days)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const nextWeek = new Date(todayDate)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const allAppointments = await appointmentsAPI.getAll()
      const upcoming = allAppointments
        .filter((apt) => {
          const aptDate = new Date(apt.appointment_date)
          return aptDate >= todayDate && aptDate <= nextWeek && apt.status !== 'cancelled'
        })
        .slice(0, 7) // Show next 7 appointments

      setUpcomingAppointments(upcoming)

      setStats({
        todayAppointments: appointments.length,
        pendingAppointments: pendingApps.length,
        confirmedAppointments: confirmedApps.length,
        completedAppointments: completedApps.length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <NavigationBar />
      
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Welcome Section with Animation */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user?.name || user?.email}</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">Here's your schedule for today</p>
        </div>

        {/* Stats Cards with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-100 text-xs sm:text-sm font-medium mb-2">
                  Today's Appointments
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.todayAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-100 text-xs sm:text-sm font-medium mb-2">
                  Confirmed
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.confirmedAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-cyan-100 text-xs sm:text-sm font-medium mb-2">
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
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div
            onClick={() => navigate('/staff/today-appointments')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stats.todayAppointments}</p>
            <p className="text-xs md:text-sm text-gray-500">View all today's appointments →</p>
          </div>

          <div
            onClick={() => navigate('/appointments/new')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">New Appointment</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">+</p>
            <p className="text-xs md:text-sm text-gray-500">Book a new customer →</p>
          </div>

          <div
            onClick={() => navigate('/staff/appointments')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">All Appointments</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{upcomingAppointments.length}+</p>
            <p className="text-xs md:text-sm text-gray-500">Manage all appointments →</p>
          </div>
        </div>

        {/* Upcoming Appointments Preview */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <button
                onClick={() => navigate('/staff/upcoming-appointments')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {apt.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apt.service_name} • {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {apt.appointment_time?.substring(0, 5)}
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
        )}

      </main>
    </div>
  )
}

export default ReceptionistDashboard
