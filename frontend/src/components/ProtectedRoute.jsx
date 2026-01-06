import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUser, setUser, removeToken } from '../utils/auth'
import { authAPI } from '../services/api'

/**
 * ProtectedRoute - Verifies authentication and refreshes user data from API
 * This ensures the user data is always fresh and matches the token
 */
function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null) // null = checking, true = valid, false = invalid
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      // First check if token exists
      if (!isAuthenticated()) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      try {
        // Verify token is valid by fetching current user from API
        const userData = await authAPI.getCurrentUser()
        
        // Update localStorage with fresh user data (ensures role is current)
        setUser(userData)
        
        setIsValid(true)
      } catch (error) {
        // Token is invalid or expired
        console.error('Authentication verification failed:', error)
        removeToken() // Clear invalid token
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [])

  if (isLoading || isValid === null) {
    // Show loading state while verifying
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return <Navigate to="/staff/login" replace />
  }

  return children
}

export default ProtectedRoute

