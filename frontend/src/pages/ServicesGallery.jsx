import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { getErrorMessage, formatCurrency } from '../utils/helpers'
import NavigationBar from '../components/NavigationBar'
import { API_URL, SERVICE_CATEGORIES } from '../utils/constants'

function ServicesGallery() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await servicesAPI.getAll()
      setServices(data)
    } catch (err) {
      setError(getErrorMessage(err))
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {})

  // Sort categories by SERVICE_CATEGORIES order
  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    const indexA = SERVICE_CATEGORIES.indexOf(a)
    const indexB = SERVICE_CATEGORIES.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory || (!s.category && selectedCategory === 'Uncategorized'))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Services Gallery</h1>
              <p className="text-sm md:text-base text-gray-600">Explore all our amazing services</p>
            </div>
            <button
              onClick={() => navigate('/staff/services')}
              className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Manage Services →
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Services
          </button>
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center animate-fade-in">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            <p className="text-gray-600 text-lg">No services found</p>
            <button
              onClick={() => navigate('/staff/services')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Add Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer bg-white animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate('/staff/services')}
              >
                {service.image_url ? (
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={`${API_URL}${service.image_url}`}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <svg className="w-16 h-16 md:w-20 md:h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 md:top-3 md:right-3">
                  <span className="px-2 md:px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-purple-600">
                    {service.category?.split(' ')[0] || 'Service'}
                  </span>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-purple-600">{formatCurrency(service.price)}</p>
                      <p className="text-xs text-gray-500">{service.duration_minutes} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ServicesGallery

