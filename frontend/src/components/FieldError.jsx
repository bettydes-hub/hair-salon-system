/**
 * FieldError - Displays inline error message for form fields
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 */
function FieldError({ message }) {
  if (!message) return null

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </p>
  )
}

export default FieldError

