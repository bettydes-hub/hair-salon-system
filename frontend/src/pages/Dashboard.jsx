import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import ManagerDashboard from './ManagerDashboard'
import ReceptionistDashboard from './ReceptionistDashboard'
import ClientDashboard from './ClientDashboard'
import { getUser, setUser } from '../utils/auth'
import { authAPI } from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Always fetch fresh user data from API to ensure role is current
        const userData = await authAPI.getCurrentUser()
        
        // Update localStorage with fresh data
        setUser(userData)
        setUserState(userData)
      } catch (error) {
        // Token invalid or expired
        console.error('Failed to load user:', error)
        navigate('/staff/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Route to appropriate dashboard based on role (from fresh API data)
  if (user.role === 'admin') {
    return <AdminDashboard />
  } else if (user.role === 'manager') {
    return <ManagerDashboard />
  } else if (user.role === 'receptionist') {
    return <ReceptionistDashboard />
  } else if (user.role === 'client') {
    return <ClientDashboard />
  } else {
    // Unknown role - redirect to login
    navigate('/staff/login')
    return null
  }
}

export default Dashboard

