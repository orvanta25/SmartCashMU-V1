import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <div className="flex justify-center items-center p-4 bg-orvanta">
      <Link
        to="/dashboard_user"
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg shadow-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition text-sm"
      >
        Aller au Dashboard
      </Link>
    </div>
  )
}