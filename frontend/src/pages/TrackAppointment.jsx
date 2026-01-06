import { useState } from 'react'
import { appointmentsAPI } from '../services/api'
import { getErrorMessage } from '../utils/helpers'
import { formatDateDisplay } from '../utils/helpers'
import { API_URL } from '../utils/constants'

function TrackAppointment() {
  const [referenceNumber, setReferenceNumber] = useState('')
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAppointment(null)

    if (!referenceNumber.trim()) {
      setError('Please enter a reference number')
      return
    }

    try {
      setLoading(true)
      const data = await appointmentsAPI.getByReference(referenceNumber.trim().toUpperCase())
      setAppointment(data)
    } catch (err) {
      setError(getErrorMessage(err))
      setAppointment(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Appointment</h1>
            <p className="text-gray-600 mb-6">Enter your appointment reference number to view status</p>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  placeholder="APT-20240115-A3B2"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {appointment && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-semibold text-gray-900">{appointment.reference_number}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Name:</span>
                      <span className="font-semibold text-gray-900">{appointment.customer_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{appointment.customer_phone}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-semibold text-gray-900">{appointment.service_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900">{formatDateDisplay(appointment.appointment_date)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold text-gray-900">{appointment.appointment_time?.substring(0, 5)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {appointment.payment_screenshot_url && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Required Deposit:</span>
                        <span className="font-semibold text-gray-900">${appointment.required_deposit}</span>
                      </div>
                      
                      {appointment.payment_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-semibold text-gray-900">${appointment.payment_amount}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verification Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getVerificationStatusColor(appointment.payment_verification_status)}`}>
                          {appointment.payment_verification_status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      
                      {appointment.payment_verification_notes && (
                        <div className="mt-2">
                          <span className="text-gray-600">Notes:</span>
                          <p className="text-sm text-gray-700 mt-1">{appointment.payment_verification_notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <span className="text-gray-600 block mb-2">Payment Screenshot:</span>
                        <img
                          src={`${API_URL}${appointment.payment_screenshot_url}`}
                          alt="Payment screenshot"
                          className="max-w-full h-auto rounded-md border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!appointment.payment_screenshot_url && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      <strong>Payment Required:</strong> Please upload your payment screenshot to confirm this appointment.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href="/appointments/new"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Book a new appointment →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackAppointment

