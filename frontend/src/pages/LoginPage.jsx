import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getDashboardPath,
  loginUser,
  persistSession,
  validateLoginForm,
} from '../services/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [googleMessage, setGoogleMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setGoogleMessage('')

    const errors = validateLoginForm({ email, password })
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setLoading(true)

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      })

      persistSession(
        {
          token: result.token,
          role: result.role,
          user: result.user,
        },
        rememberMe,
      )

      const redirectPath = location.state?.from?.pathname || getDashboardPath(result.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('')
    setGoogleMessage(
      'Google Sign In belum aktif karena konfigurasi OAuth/backend belum tersedia. TODO: tambahkan endpoint OAuth dan client ID Google.',
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">
        
        {/* Left Section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                WELCOME BACK
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter your email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                {fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Remember me
                </label>

                <Link
                  to="/reset-password"
                  className="font-medium text-gray-600 hover:text-red-600"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {location.state?.message && !error && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  {location.state.message}
                </div>
              )}

              {error && (
                <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {googleMessage && (
                <div role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {googleMessage}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <span className="text-base font-bold">G</span>
                Sign in with Google
              </button>

              {/* Register */}
              <p className="pt-2 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-red-600 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0">
            <img
              src="/images/login-bg.jpeg"
              alt="Login Background"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  )
}
