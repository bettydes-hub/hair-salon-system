import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { servicesAPI } from '../services/api'
import { API_URL } from '../utils/constants'
import { getErrorMessage } from '../utils/helpers'

function Home() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await servicesAPI.getAll()
      setServices(data.slice(0, 6)) // Show first 6 services
      setLoading(false)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">Beauty Salon</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/track')}
                className="px-4 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium"
              >
                Track Appointment
              </button>
              <button
                onClick={() => navigate('/appointments/new')}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-medium shadow-lg"
              >
                Book Now
              </button>
              <button
                onClick={() => navigate('/staff/login')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Our
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"> Beauty Salon</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book your appointment online. No account needed. Quick and easy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/appointments/new')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
            >
              Book Appointment
            </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="px-8 py-4 bg-white text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition-all duration-300 font-semibold text-lg"
              >
                How It Works
              </button>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-gray-600">Discover our range of beauty and hair services</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => navigate('/services-gallery')}
              >
                {service.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`${API_URL}${service.image_url}`}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description || 'Professional service'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{service.duration_minutes} min</span>
                    <span className="text-lg font-bold text-pink-600">${service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/services-gallery')}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg"
          >
            View All Services
          </button>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to book your appointment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Service</h3>
              <p className="text-gray-600">Select the service you need and pick a date & time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay Deposit</h3>
              <p className="text-gray-600">Pay 10% deposit and upload payment screenshot</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Confirmed</h3>
              <p className="text-gray-600">We verify your payment and confirm your appointment</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg"
            >
              Learn More →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Beauty Salon</h3>
              <p className="text-gray-400">Your trusted beauty and hair care destination</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate('/appointments/new')} className="hover:text-white transition-colors">
                    Book Appointment
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/services-gallery')} className="hover:text-white transition-colors">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/track')} className="hover:text-white transition-colors">
                    Track Appointment
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Staff</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate('/staff/login')} className="hover:text-white transition-colors">
                    Staff Login
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Beauty Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

