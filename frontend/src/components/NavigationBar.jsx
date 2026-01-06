import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUser, isAdmin, isManager, isReceptionist, isClient } from '../utils/auth'
import { authAPI } from '../services/api'
import { API_URL } from '../utils/constants'

function NavigationBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authAPI.logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const adminNavItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/appointments/new', label: 'New Appointment', icon: 'plus' },
    { path: '/staff/services', label: 'Services', icon: 'scissors' },
    { path: '/staff/working-hours', label: 'Working Hours', icon: 'clock' },
    { path: '/staff/users', label: 'Users', icon: 'users' },
  ]

  const managerNavItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/appointments/new', label: 'New Appointment', icon: 'plus' },
    { path: '/staff/services', label: 'Services', icon: 'scissors' },
    { path: '/staff/working-hours', label: 'Working Hours', icon: 'clock' },
  ]

  const receptionistNavItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/appointments/new', label: 'New Appointment', icon: 'plus' },
  ]

  const clientNavItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/appointments', label: 'My Appointments', icon: 'calendar' },
    { path: '/appointments/new', label: 'Book Appointment', icon: 'plus' },
    { path: '/services-gallery', label: 'Services', icon: 'scissors' },
  ]

  const getIcon = (iconName) => {
    const icons = {
      dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      calendar: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      plus: 'M12 4v16m8-8H4',
      scissors: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    }
    return icons[iconName] || icons.dashboard
  }

  let navItems = []
  if (isAdmin()) {
    navItems = adminNavItems
  } else if (isManager()) {
    navItems = managerNavItems
  } else if (isReceptionist()) {
    navItems = receptionistNavItems
  } else if (isClient()) {
    navItems = clientNavItems
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-base md:text-xl font-bold text-gray-900 hidden sm:inline">Salon Manager</span>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-3 xl:px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                </svg>
                <span className="font-medium text-sm xl:text-base">{item.label}</span>
                {isActive(item.path) && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full animate-pulse"></span>
                )}
              </button>
            ))}
          </div>

          {/* User Info & Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => navigate('/staff/profile')}
              className="flex items-center space-x-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              {user?.profile_photo_url ? (
                <img
                  src={`${API_URL}${user.profile_photo_url}`}
                  alt={user?.name}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs md:text-sm font-bold ${user?.profile_photo_url ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setMobileMenuOpen(false)
                  }}
                  className={`relative px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 text-left ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                  </svg>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavigationBar

