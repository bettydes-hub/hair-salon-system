import { useEffect } from 'react'

/**
 * SuccessMessage - Displays user-friendly success messages
 * 
 * @param {Object} props
 * @param {string} props.message - Success message to display
 * @param {Function} props.onDismiss - Optional callback when message is dismissed
 * @param {boolean} props.autoDismiss - Whether to auto-dismiss after 3 seconds (default: true)
 */
function SuccessMessage({ message, onDismiss, autoDismiss = true }) {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  if (!message) return null

  return (
    <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-fade-in">
      <div className="flex items-start space-x-3">
        <svg 
          className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1">
          <p className="text-green-800 font-semibold mb-1">Success</p>
          <p className="text-green-700 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600 focus:outline-none"
            aria-label="Dismiss message"
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

export default SuccessMessage

