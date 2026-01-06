import { useEffect } from 'react'

/**
 * ErrorMessage - Displays user-friendly error messages
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onDismiss - Optional callback when error is dismissed
 * @param {boolean} props.autoDismiss - Whether to auto-dismiss after 5 seconds (default: false)
 */
function ErrorMessage({ message, onDismiss, autoDismiss = false }) {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  if (!message) return null

  // Check if it's a network/server error that needs special handling
  const isNetworkError = message.toLowerCase().includes('connect') || 
                        message.toLowerCase().includes('server') ||
                        message.toLowerCase().includes('backend')

  return (
    <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-fade-in">
      <div className="flex items-start space-x-3">
        <svg 
          className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1">
          <p className="text-red-800 font-semibold mb-1">Error</p>
          <p className="text-red-700 text-sm">{message}</p>
          {isNetworkError && (
            <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
              <p className="text-red-600 text-xs font-medium mb-1">💡 Troubleshooting Tips:</p>
              <ul className="text-red-600 text-xs list-disc list-inside space-y-1">
                <li>Make sure the backend server is running on http://localhost:5000</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 focus:outline-none"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage

