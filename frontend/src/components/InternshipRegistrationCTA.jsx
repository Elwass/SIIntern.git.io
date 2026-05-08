import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredSession } from '../services/auth'

export default function InternshipRegistrationCTA({ className = '', children = 'Daftar Magang' }) {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  const handleClick = () => {
    const session = getStoredSession()

    if (!session) {
      navigate('/register')
      return
    }

    if (session.role?.toLowerCase() === 'student') {
      navigate('/student/applications')
      return
    }

    setMessage('Akses pendaftaran magang hanya tersedia untuk akun mahasiswa.')
  }

  return (
    <div>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
      {message && <p className="mt-3 text-sm font-medium text-amber-700">{message}</p>}
    </div>
  )
}
