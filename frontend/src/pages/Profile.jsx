import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { getUser } from '../utils/auth'
import { getErrorMessage } from '../utils/helpers'
import NavigationBar from '../components/NavigationBar'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import { API_URL } from '../utils/constants'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'password'
  
  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
      })
      if (userData.profile_photo_url) {
        setPhotoPreview(`${API_URL}${userData.profile_photo_url}`)
      }
    } catch (err) {
      setError(getErrorMessage(err))
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please select a PNG, JPG, JPEG, GIF, or WEBP image.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.')
      return
    }

    setPhotoFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload photo
    try {
      setUploadingPhoto(true)
      const result = await authAPI.uploadProfilePhoto(file)
      setUser(result.user)
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(result.user))
      setSuccess('Profile photo uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      setPhotoFile(null)
      setPhotoPreview(user?.profile_photo_url ? `${API_URL}${user.profile_photo_url}` : null)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const result = await authAPI.updateProfile(profileData)
      setUser(result.user)
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(result.user))
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setError('All password fields are required')
      return
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New password and confirm password do not match')
      return
    }

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      setSuccess('Password changed successfully!')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <NavigationBar />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Success/Error Messages */}
          <SuccessMessage message={success} onDismiss={() => setSuccess('')} />
          <ErrorMessage message={error} onDismiss={() => setError('')} />

          {/* Profile Photo Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6 animate-slide-up">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Profile Photo</h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                    className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF or WEBP. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-all duration-300 ${
                    activeTab === 'password'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Change Password
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 sm:space-x-0">
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileData({
                          name: user?.name || '',
                          email: user?.email || '',
                        })
                      }}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="current_password"
                        required
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="new_password"
                        required
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirm_password"
                        required
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 sm:space-x-0">
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          confirm_password: '',
                        })
                      }}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="mt-4 md:mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg shadow-lg p-4 md:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Account Actions</h2>
                <p className="text-xs md:text-sm text-gray-600">Sign out of your account</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-base md:text-lg border-2 border-red-400"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile

