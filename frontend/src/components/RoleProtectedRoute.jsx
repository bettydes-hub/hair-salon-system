import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, setUser } from '../utils/auth'
import { authAPI } from '../services/api'

/**
 * RoleProtectedRoute - Protects routes based on user role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: /staff/dashboard)
 */
function RoleProtectedRoute({ children, allowedRoles, redirectTo = '/staff/dashboard' }) {
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(null) // null = checking, true = authorized, false = unauthorized
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      // First check if authenticated
      if (!isAuthenticated()) {
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      try {
        // Get fresh user data from API (not from localStorage which can be stale)
        const userData = await authAPI.getCurrentUser()
        
        // Check if user's role is in allowed roles
        const userRole = userData.role
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
        const hasAccess = rolesArray.includes(userRole)

        if (hasAccess) {
          // Update localStorage with fresh user data
          setUser(userData)
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } catch (error) {
        // If API call fails (e.g., token expired), user is not authorized
        console.error('Authorization check failed:', error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [allowedRoles])

  if (isLoading || isAuthorized === null) {
    // Show loading state while checking
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    // Redirect to appropriate dashboard based on user role, or login if not authenticated
    const user = getUser()
    if (user && user.role) {
      // User is authenticated but doesn't have the right role - redirect to their dashboard
      return <Navigate to={redirectTo} replace />
    } else {
      // User is not authenticated - redirect to login
      return <Navigate to="/staff/login" replace />
    }
  }

  // User is authorized - render the protected component
  return children
}

export default RoleProtectedRoute

