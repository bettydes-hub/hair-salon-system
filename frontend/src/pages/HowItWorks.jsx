import { useNavigate } from 'react-router-dom'

function HowItWorks() {
  const navigate = useNavigate()

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
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium"
              >
                Home
              </button>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Works</span>
            </h1>
            <p className="text-xl text-gray-600">
              Simple steps to book your appointment online
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Browse our wide range of beauty and hair services. From haircuts to facials, we have everything you need to look and feel your best.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>View all available services with descriptions and prices</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>See service duration and pricing upfront</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Select the perfect service for your needs</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate('/services-gallery')}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Browse Services →
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Pick a convenient date and time slot that works for you. Our system shows you all available time slots in real-time.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Choose from available dates on our calendar</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>See real-time availability for each time slot</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Enter your contact information (name, phone, optional email)</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate('/appointments/new')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Book Appointment →
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Pay 10% Deposit</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    To confirm your appointment, you need to pay a 10% deposit. This secures your booking and ensures your time slot is reserved.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Calculate 10% of your service price (e.g., $50 service = $5 deposit)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Pay via Telebirr, bank transfer, or any payment method you prefer</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Take a screenshot or photo of your payment receipt</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Upload the payment screenshot in the booking form</span>
                    </li>
                  </ul>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 font-semibold mb-2">💡 Payment Methods Accepted:</p>
                    <ul className="text-green-700 space-y-1">
                      <li>• Telebirr</li>
                      <li>• Bank Transfer</li>
                      <li>• Mobile Money</li>
                      <li>• Cash (if paying in person)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">AI Verification</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Our AI system automatically verifies your payment to ensure everything is correct before confirming your appointment.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>AI reads your payment screenshot to extract amount and date</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Verifies that payment amount is at least 10% of service price</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Checks payment date to ensure it's recent</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Marks payment as verified or rejected based on AI analysis</span>
                    </li>
                  </ul>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-purple-800 font-semibold mb-2">🤖 AI Assistant:</p>
                    <p className="text-purple-700">
                      Our AI is an assistant, not the final authority. If there's any issue, our managers can always review and override the AI's decision to ensure fairness.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">5</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Get Confirmed</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Once your payment is verified, your appointment status changes to "confirmed" and you're all set!
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Receive your unique appointment reference number</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save your reference number to track your appointment anytime</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>If payment is rejected, you'll be notified and can upload a new screenshot</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Your appointment is confirmed and your time slot is secured</span>
                    </li>
                  </ul>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-800 font-semibold mb-2">📱 Track Your Appointment:</p>
                    <p className="text-orange-700 mb-3">
                      Use your reference number to check your appointment status anytime, even without creating an account!
                    </p>
                    <button
                      onClick={() => navigate('/track')}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
                    >
                      Track Appointment →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-lg p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-xl mb-8 opacity-90">
              Start your booking process now. It only takes a few minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/appointments/new')}
                className="px-8 py-4 bg-white text-pink-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                Book Appointment Now
              </button>
              <button
                onClick={() => navigate('/services-gallery')}
                className="px-8 py-4 bg-pink-600 border-2 border-white text-white rounded-lg hover:bg-pink-700 transition-all duration-300 font-semibold text-lg"
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
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
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                    How It Works
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

export default HowItWorks

