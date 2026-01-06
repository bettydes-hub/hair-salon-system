import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isAuthenticated } from './utils/auth'
import { authAPI } from './services/api'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import NewAppointment from './pages/NewAppointment'
import Services from './pages/Services'
import WorkingHours from './pages/WorkingHours'
import Users from './pages/Users'
import Profile from './pages/Profile'
import TodayAppointments from './pages/TodayAppointments'
import UpcomingAppointments from './pages/UpcomingAppointments'
import ServicesGallery from './pages/ServicesGallery'
import RecentUsers from './pages/RecentUsers'
import TrackAppointment from './pages/TrackAppointment'
import HowItWorks from './pages/HowItWorks'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import ChangePasswordModal from './components/ChangePasswordModal'

function App() {
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    // Check if password change is required
    const checkPasswordChangeRequired = async () => {
      if (!isAuthenticated()) {
        return
      }

      // Check localStorage first (faster)
      // If flag is explicitly 'false', don't show modal
      const mustChangePasswordFlag = localStorage.getItem('must_change_password')
      const mustChangePasswordLocal = mustChangePasswordFlag === 'true'
      const isExplicitlyFalse = mustChangePasswordFlag === 'false'
      
      // If explicitly false, don't check API - password was already changed
      if (isExplicitlyFalse) {
        setShowPasswordModal(false)
        return
      }
      
      if (mustChangePasswordLocal) {
        // Also verify with API to ensure it's still required
        try {
          const userData = await authAPI.getCurrentUser()
          if (userData.must_change_password) {
            setShowPasswordModal(true)
          } else {
            // API says it's not required, clear localStorage
            localStorage.removeItem('must_change_password')
            setShowPasswordModal(false)
          }
        } catch (error) {
          // If API call fails, use localStorage value
          if (mustChangePasswordLocal) {
            setShowPasswordModal(true)
          }
        }
      } else {
        // Double-check with API if localStorage says it's not required
        try {
          const userData = await authAPI.getCurrentUser()
          if (userData.must_change_password) {
            localStorage.setItem('must_change_password', 'true')
            setShowPasswordModal(true)
          }
        } catch (error) {
          // API call failed, don't show modal
        }
      }
    }

    checkPasswordChangeRequired()
  }, [])

  const handlePasswordChangeSuccess = async () => {
    // Set flag to 'false' explicitly to prevent interceptor from re-setting it
    localStorage.setItem('must_change_password', 'false')
    setShowPasswordModal(false)
    
    // Verify with API that password change is no longer required
    try {
      const userData = await authAPI.getCurrentUser()
      if (!userData.must_change_password) {
        // Update user in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, must_change_password: false }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // Ensure flag is cleared
        localStorage.removeItem('must_change_password')
      }
    } catch (error) {
      console.error('Error verifying password change:', error)
      // Even if API call fails, remove the flag since password was changed
      localStorage.removeItem('must_change_password')
    }
    
    // Small delay to ensure database commit is complete, then reload
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      {showPasswordModal && (
        <ChangePasswordModal onSuccess={handlePasswordChangeSuccess} />
      )}
      <Routes>
        {/* ========== PUBLIC ROUTES (No Authentication Required) ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/services-gallery" element={<ServicesGallery />} />
        <Route path="/track" element={<TrackAppointment />} />
        
        {/* ========== STAFF ROUTES (Authentication Required) ========== */}
        {/* Staff Login */}
        <Route path="/staff/login" element={<Login />} />
        
        {/* Staff Dashboard & Management */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/working-hours"
          element={
            <ProtectedRoute>
              <WorkingHours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/users"
          element={
            <RoleProtectedRoute allowedRoles="admin">
              <Users />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/today-appointments"
          element={
            <ProtectedRoute>
              <TodayAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/upcoming-appointments"
          element={
            <ProtectedRoute>
              <UpcomingAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/recent-users"
          element={
            <RoleProtectedRoute allowedRoles="admin">
              <RecentUsers />
            </RoleProtectedRoute>
          }
        />
        
        {/* Legacy routes - redirect to staff routes for backward compatibility */}
        <Route path="/login" element={<Navigate to="/staff/login" replace />} />
        <Route path="/dashboard" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/appointments" element={<Navigate to="/staff/appointments" replace />} />
        <Route path="/services" element={<Navigate to="/staff/services" replace />} />
        <Route path="/working-hours" element={<Navigate to="/staff/working-hours" replace />} />
        <Route path="/users" element={<Navigate to="/staff/users" replace />} />
        <Route path="/profile" element={<Navigate to="/staff/profile" replace />} />
        <Route path="/today-appointments" element={<Navigate to="/staff/today-appointments" replace />} />
        <Route path="/upcoming-appointments" element={<Navigate to="/staff/upcoming-appointments" replace />} />
        <Route path="/recent-users" element={<Navigate to="/staff/recent-users" replace />} />
        
        {/* Default redirect - public home for non-authenticated, staff dashboard for authenticated */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/staff/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  )
}

export default App

