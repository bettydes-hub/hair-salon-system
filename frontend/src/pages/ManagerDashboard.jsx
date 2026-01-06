import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, appointmentsAPI, servicesAPI } from '../services/api'
import { getUser } from '../utils/auth'
import NavigationBar from '../components/NavigationBar'

function ManagerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    appointments: 0,
    services: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
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

      // Get all stats
      const [appointments, servicesData] = await Promise.all([
        appointmentsAPI.getAll(),
        servicesAPI.getAll(),
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayApps = appointments.filter((apt) => apt.appointment_date === today)
      const pendingApps = appointments.filter((apt) => apt.status === 'pending')
      const confirmedApps = appointments.filter((apt) => apt.status === 'confirmed')
      const completedApps = appointments.filter((apt) => apt.status === 'completed')
      const cancelledApps = appointments.filter((apt) => apt.status === 'cancelled')

      // Get upcoming appointments count (next 7 days)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const nextWeek = new Date(todayDate)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const upcoming = appointments
        .filter((apt) => {
          const aptDate = new Date(apt.appointment_date)
          return aptDate >= todayDate && aptDate <= nextWeek && apt.status !== 'cancelled'
        })

      setUpcomingAppointments(upcoming)

      setStats({
        appointments: appointments.length,
        services: servicesData.length,
        todayAppointments: todayApps.length,
        pendingAppointments: pendingApps.length,
        confirmedAppointments: confirmedApps.length,
        completedAppointments: completedApps.length,
        cancelledAppointments: cancelledApps.length,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <NavigationBar />
      
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Welcome Section with Animation */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name || user?.email}</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">Here's what's happening at your salon today</p>
        </div>

        {/* Stats Cards with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-100 text-xs sm:text-sm font-medium mb-2">
                  Total Appointments
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.appointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-100 text-xs sm:text-sm font-medium mb-2">
                  Today's Appointments
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.todayAppointments}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-100 text-xs sm:text-sm font-medium mb-2">
                  Active Services
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  {stats.services}
                </p>
              </div>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-orange-100 text-xs sm:text-sm font-medium mb-2">
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

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
              Pending
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {stats.pendingAppointments}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-green-500">
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
              Confirmed
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats.confirmedAppointments}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
              Completed
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {stats.completedAppointments}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-red-500">
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
              Cancelled
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {stats.cancelledAppointments}
            </p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div
            onClick={() => navigate('/staff/today-appointments')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{stats.todayAppointments}</p>
            <p className="text-xs md:text-sm text-gray-500">View all today's appointments →</p>
          </div>

          <div
            onClick={() => navigate('/staff/upcoming-appointments')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Upcoming</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{upcomingAppointments.length}</p>
            <p className="text-xs md:text-sm text-gray-500">Next 7 days →</p>
          </div>

          <div
            onClick={() => navigate('/services-gallery')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Services Gallery</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{stats.services}</p>
            <p className="text-xs md:text-sm text-gray-500">View all services →</p>
          </div>

          <div
            onClick={() => navigate('/staff/services')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Manage Services</h3>
              <svg className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">{stats.services}</p>
            <p className="text-xs md:text-sm text-gray-500">Add/edit services →</p>
          </div>
        </div>

      </main>
    </div>
  )
}

export default ManagerDashboard
