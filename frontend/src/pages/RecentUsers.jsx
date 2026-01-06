import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { formatDateDisplay, getErrorMessage } from '../utils/helpers'
import NavigationBar from '../components/NavigationBar'
import { API_URL } from '../utils/constants'

function RecentUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'admin', 'manager', 'receptionist', 'client'

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const allUsers = await usersAPI.getAll()
      
      // Sort by created_at (most recent first)
      const sorted = [...allUsers].sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return dateB - dateA
      })
      
      let filtered = sorted
      if (filter !== 'all') {
        filtered = sorted.filter(user => user.role === filter)
      }
      
      setUsers(filtered)
    } catch (err) {
      setError(getErrorMessage(err))
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'receptionist':
        return 'bg-green-100 text-green-800'
      case 'client':
        return 'bg-orange-100 text-orange-800'
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
            <p className="mt-4 text-gray-600">Loading users...</p>
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Recent Users</h1>
              <p className="text-sm md:text-base text-gray-600">All registered users in the system</p>
            </div>
            <button
              onClick={() => navigate('/staff/users')}
              className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Manage Users →
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
          {['all', 'admin', 'manager', 'receptionist', 'client'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                filter === role
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center animate-fade-in">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No users found</p>
            <button
              onClick={() => navigate('/staff/users')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Create User
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-lg p-4 md:p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  {user.profile_photo_url ? (
                    <img
                      src={`${API_URL}${user.profile_photo_url}`}
                      alt={user.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0 ${user.profile_photo_url ? 'hidden' : ''}`}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className={`px-2 md:px-3 py-1 text-xs font-semibold rounded-full w-fit ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500">
                    Joined {formatDateDisplay(user.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default RecentUsers

