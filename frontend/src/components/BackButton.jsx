import { useNavigate } from 'react-router-dom'

function BackButton({ to = '/dashboard', label = 'Back' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(to)
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      title="Go back"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export default BackButton

