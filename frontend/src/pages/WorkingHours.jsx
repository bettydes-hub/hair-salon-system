import { useState, useEffect } from 'react'
import { workingHoursAPI } from '../services/api'
import { getErrorMessage } from '../utils/helpers'
import { isAdmin, isManager } from '../utils/auth'
import { DAYS_OF_WEEK } from '../utils/constants'
import BackButton from '../components/BackButton'

function WorkingHours() {
  const [workingHours, setWorkingHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingDay, setEditingDay] = useState(null)
  const [formData, setFormData] = useState({
    open_time: '',
    close_time: '',
    is_closed: false,
  })

  useEffect(() => {
    if (!isAdmin() && !isManager()) {
      setError('Manager or admin access required')
      return
    }
    loadWorkingHours()
  }, [])

  const loadWorkingHours = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await workingHoursAPI.getAll()
      setWorkingHours(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (day) => {
    setEditingDay(day)
    setError('') // Clear any previous errors
    setFormData({
      open_time: day.open_time.substring(0, 5), // Get HH:MM from HH:MM:SS
      close_time: day.close_time.substring(0, 5),
      is_closed: day.is_closed,
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation - times required if not closed
    if (!formData.is_closed) {
      if (!formData.open_time || !formData.close_time) {
        setError('Open time and close time are required when day is open')
        return
      }
      
      // Check if close time is after open time
      const openTime = new Date(`2000-01-01T${formData.open_time}`)
      const closeTime = new Date(`2000-01-01T${formData.close_time}`)
      if (closeTime <= openTime) {
        setError('Close time must be after open time')
        return
      }
    }

    try {
      // Prepare data - always send times (even if closed, backend keeps them)
      const updateData = {
        is_closed: formData.is_closed,
        open_time: formData.open_time || editingDay.open_time.substring(0, 5),
        close_time: formData.close_time || editingDay.close_time.substring(0, 5),
      }
      
      const result = await workingHoursAPI.update(editingDay.id, updateData)
      setSuccess(result.message || 'Working hours updated successfully')
      setEditingDay(null)
      setFormData({ open_time: '', close_time: '', is_closed: false })
      loadWorkingHours()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleCancel = () => {
    setEditingDay(null)
    setFormData({ open_time: '', close_time: '', is_closed: false })
  }

  const handleInitialize = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await workingHoursAPI.initialize()
      setSuccess('Working hours initialized successfully!')
      await loadWorkingHours()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin() && !isManager()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Manager or admin access required</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading working hours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/staff/dashboard" />
          <h1 className="text-3xl font-bold text-gray-900">Working Hours</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {workingHours.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No working hours found. Initialize default working hours to get started.</p>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Initializing...' : 'Initialize Working Hours'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Open Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Close Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workingHours.map((day) => (
                <tr key={day.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{day.day_of_week}</div>
                  </td>
                  {editingDay?.id === day.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          name="open_time"
                          value={formData.open_time}
                          onChange={handleChange}
                          disabled={formData.is_closed}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          name="close_time"
                          value={formData.close_time}
                          onChange={handleChange}
                          disabled={formData.is_closed}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_closed"
                            checked={formData.is_closed}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Closed</span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <form onSubmit={handleSubmit} className="inline-flex gap-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.is_closed ? '—' : day.open_time.substring(0, 5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.is_closed ? '—' : day.close_time.substring(0, 5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            day.is_closed
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {day.is_closed ? 'Closed' : 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(day)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkingHours

