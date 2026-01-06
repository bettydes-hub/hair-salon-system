import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentsAPI } from '../services/api'
import { formatTime, formatDateDisplay, getErrorMessage } from '../utils/helpers'
import NavigationBar from '../components/NavigationBar'

function UpcomingAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      const allAppointments = await appointmentsAPI.getAll()
      
      // Get upcoming appointments (next 7 days, not cancelled)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const upcoming = allAppointments
        .filter((apt) => {
          const aptDate = new Date(apt.appointment_date)
          return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled'
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
          return dateA - dateB
        })
      
      setAppointments(upcoming)
    } catch (err) {
      setError(getErrorMessage(err))
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <NavigationBar />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Upcoming Appointments</h1>
          <p className="text-sm md:text-base text-gray-600">Next 7 days</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center animate-fade-in">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 text-lg">No upcoming appointments</p>
            <button
              onClick={() => navigate('/appointments/new')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Create New Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {appointments.map((apt, index) => (
              <div
                key={apt.id}
                className="bg-white rounded-lg shadow-lg p-4 md:p-6 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{apt.customer_name}</h3>
                      <span className={`px-2 md:px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-sm md:text-base">{formatDateDisplay(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-sm md:text-base">{formatTime(apt.appointment_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        </svg>
                        <span className="text-sm md:text-base truncate">{apt.service_name || 'Service'}</span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">{apt.customer_phone}</p>
                  </div>
                  <button
                    onClick={() => navigate('/staff/appointments')}
                    className="sm:ml-4 px-3 md:px-4 py-2 text-sm md:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default UpcomingAppointments

