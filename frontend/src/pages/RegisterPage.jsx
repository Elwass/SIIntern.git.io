import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getDashboardPath,
  persistSession,
  registerUser,
  validateRegisterForm,
} from '../services/auth'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')

    const errors = validateRegisterForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setLoading(true)

    try {
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      if (result.token) {
        persistSession(
          {
            token: result.token,
            role: result.role,
            user: result.user,
          },
          true,
        )
        navigate(getDashboardPath(result.role), { replace: true })
        return
      }

      navigate('/login', {
        replace: true,
        state: { message: 'Registrasi berhasil. Silakan login.' },
      })
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                CREATE ACCOUNT
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                Daftar akun SIIntern untuk memulai proses magang DPRD Banyumas.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={updateField('name')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter your email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={updateField('password')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Create a password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                {fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Repeat your password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                {fieldErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-xs text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>

              <p className="pt-2 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-red-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0">
            <img src="/images/login-bg.jpeg" alt="Register Background" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  )
}
