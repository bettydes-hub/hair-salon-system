import { useState, useEffect } from 'react'
import { servicesAPI } from '../services/api'
import { getErrorMessage, formatCurrency } from '../utils/helpers'
import { isAdmin, isManager } from '../utils/auth'
import { SERVICE_CATEGORIES, API_URL } from '../utils/constants'
import BackButton from '../components/BackButton'

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    duration_minutes: '',
    price: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!isAdmin() && !isManager()) {
      setError('Manager or admin access required')
      return
    }
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
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'duration_minutes' || name === 'price' ? value : value,
    })
  }

  const handleImageChange = async (e) => {
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

    setImageFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    try {
      setUploadingImage(true)
      const result = await servicesAPI.uploadImage(file)
      setFormData({
        ...formData,
        image_url: result.image_url,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      setImageFile(null)
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Convert string values to proper types
    const submitData = {
      ...formData,
      duration_minutes: parseInt(formData.duration_minutes, 10),
      price: parseFloat(formData.price),
    }

    // Validate conversions
    if (isNaN(submitData.duration_minutes) || submitData.duration_minutes <= 0) {
      setError('Duration must be a positive number')
      return
    }
    if (isNaN(submitData.price) || submitData.price < 0) {
      setError('Price must be a valid number')
      return
    }

    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, submitData)
      } else {
        await servicesAPI.create(submitData)
      }

      // Reset form and reload
      setFormData({ name: '', description: '', category: '', image_url: '', duration_minutes: '', price: '' })
      setImageFile(null)
      setImagePreview(null)
      setShowForm(false)
      setEditingService(null)
      loadServices()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      image_url: service.image_url || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
    })
    setImageFile(null)
    setImagePreview(service.image_url ? `${API_URL}${service.image_url}` : null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) {
      return
    }

    try {
      await servicesAPI.delete(id)
      loadServices()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingService(null)
    setFormData({ name: '', description: '', category: '', image_url: '', duration_minutes: '', price: '' })
    setImageFile(null)
    setImagePreview(null)
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
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <BackButton to="/staff/dashboard" />
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Service
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Service Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Haircut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {uploadingImage && (
                  <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
                )}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Service description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    min="1"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No services found. Create your first service!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedServices[category].map((service) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {service.image_url ? (
                            <img
                              src={`${API_URL}${service.image_url}`}
                              alt={service.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64?text=No+Image'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {service.description || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.duration_minutes} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(service.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services

