import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentsAPI, servicesAPI } from '../services/api'
import { getErrorMessage, formatDate, getToday, isValidPhone, isValidEmail } from '../utils/helpers'
import BackButton from '../components/BackButton'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import FieldError from '../components/FieldError'
import { API_URL } from '../utils/constants'

function NewAppointment() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1) // 1: Appointment details, 2: Payment upload
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [paymentFile, setPaymentFile] = useState(null)
  const [paymentPreview, setPaymentPreview] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    appointment_date: getToday(),
    appointment_time: '',
    payment_amount: '',
  })

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (formData.service_id && formData.appointment_date) {
      loadAvailableSlots()
      // Set selected service for deposit calculation
      const service = services.find(s => s.id === parseInt(formData.service_id))
      setSelectedService(service)
    }
  }, [formData.service_id, formData.appointment_date, services])

  const loadServices = async () => {
    try {
      const data = await servicesAPI.getAll()
      setServices(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const loadAvailableSlots = async () => {
    if (!formData.service_id || !formData.appointment_date) return

    try {
      setLoadingSlots(true)
      const data = await appointmentsAPI.getAvailableSlots(
        formData.appointment_date,
        parseInt(formData.service_id)
      )
      setAvailableSlots(data.available_slots || [])
    } catch (err) {
      setError(getErrorMessage(err))
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PNG, JPG, GIF image, or PDF document')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
        setError(`File is too large (${fileSizeMB} MB). Maximum file size is 5 MB. Please compress or choose a smaller file.`)
        return
      }

      setPaymentFile(file)
      setError('')

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPaymentPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPaymentPreview(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation with clear messages
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)')
      return
    }

    if (!isValidPhone(formData.customer_phone)) {
      setError('Please enter a valid phone number with at least 10 digits')
      return
    }

    if (formData.customer_email && !isValidEmail(formData.customer_email)) {
      setError('Please enter a valid email address (e.g., name@example.com)')
      return
    }

    if (!formData.service_id) {
      setError('Please select a service')
      return
    }

    if (!formData.appointment_date) {
      setError('Please select an appointment date')
      return
    }

    if (!formData.appointment_time) {
      setError('Please select an available time slot')
      return
    }

    try {
      setLoading(true)
      const response = await appointmentsAPI.create({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || undefined,
        service_id: parseInt(formData.service_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        created_by: 'customer',
      })

      setCreatedAppointment(response.appointment)
      setStep(2) // Move to payment step
      setSuccess('Appointment created! Please upload payment screenshot to confirm.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentUpload = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!paymentFile) {
      setError('Please upload a screenshot or photo of your payment receipt')
      return
    }

    if (!formData.payment_amount || parseFloat(formData.payment_amount) <= 0) {
      setError('Please enter the payment amount you paid')
      return
    }

    try {
      setLoading(true)
      await appointmentsAPI.uploadPayment(createdAppointment.id, paymentFile, formData.payment_amount)
      
      setSuccess('Payment screenshot uploaded successfully! Your appointment is pending verification. You will receive a confirmation once verified.')
      
      // Show reference number
      setTimeout(() => {
        alert(`Your appointment reference number is: ${createdAppointment.reference_number}\n\nPlease save this number to track your appointment status.`)
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const requiredDeposit = selectedService ? (parseFloat(selectedService.price) * 0.10).toFixed(2) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <BackButton to="/" label="Back" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Fill in your details and select a time slot' : 'Upload payment screenshot to confirm your appointment'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
            <SuccessMessage message={success} onDismiss={() => setSuccess('')} />

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="555-123-4567"
                  />
                  <p className="mt-1 text-xs text-gray-500">At least 10 digits required</p>
                </div>

                {/* Customer Email (Optional) */}
                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="john@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">For appointment confirmations</p>
                </div>

                {/* Service Selection */}
                <div>
                  <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    id="service_id"
                    name="service_id"
                    required
                    value={formData.service_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price} ({service.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Date */}
                <div>
                  <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    id="appointment_date"
                    name="appointment_date"
                    type="date"
                    required
                    min={getToday()}
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Available Time Slots */}
                {formData.service_id && formData.appointment_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots *
                    </label>
                    {loadingSlots ? (
                      <p className="text-gray-500">Loading available slots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-red-600">No available slots for this date</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData({ ...formData, appointment_time: slot })}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              formData.appointment_time === slot
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Deposit Info */}
                {selectedService && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Required Deposit:</strong> ${requiredDeposit} (10% of ${selectedService.price})
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You'll be asked to upload payment proof in the next step
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.appointment_time}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePaymentUpload} className="space-y-6">
                {/* Appointment Summary */}
                {createdAppointment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Reference Number:</strong> {createdAppointment.reference_number}</p>
                      <p><strong>Service:</strong> {selectedService?.name}</p>
                      <p><strong>Date:</strong> {formatDate(createdAppointment.appointment_date)}</p>
                      <p><strong>Time:</strong> {createdAppointment.appointment_time}</p>
                      <p><strong>Required Deposit:</strong> ${createdAppointment.required_deposit}</p>
                    </div>
                  </div>
                )}

                {/* Payment Amount */}
                <div>
                  <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount *
                  </label>
                  <input
                    id="payment_amount"
                    name="payment_amount"
                    type="number"
                    step="0.01"
                    min={requiredDeposit}
                    required
                    value={formData.payment_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder={requiredDeposit}
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum: ${requiredDeposit}</p>
                </div>

                {/* Payment Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {paymentPreview ? (
                        <div className="mt-2">
                          <img
                            src={paymentPreview}
                            alt="Payment preview"
                            className="max-h-48 mx-auto rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentFile(null)
                              setPaymentPreview(null)
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="payment_screenshot"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="payment_screenshot"
                                name="payment_screenshot"
                                type="file"
                                accept="image/*,.pdf"
                                className="sr-only"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Payment Instructions</h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Pay 10% deposit (${requiredDeposit}) via Telebirr, bank transfer, or other methods</li>
                    <li>Upload a screenshot or photo of your payment receipt</li>
                    <li>Your appointment will be confirmed after verification</li>
                    <li>Save your reference number: <strong>{createdAppointment?.reference_number}</strong></li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentFile}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Uploading...' : 'Upload Payment & Complete'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewAppointment
