import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const roleRedirectMap = {
  admin: '/admin',
  mentor: '/mentor',
  student: '/student',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Login failed. Please check your credentials.'
        )
      }

      localStorage.setItem('token', result.token)
      localStorage.setItem('role', result.role)

      localStorage.setItem(
        'user',
        JSON.stringify(result.user || { email, role: result.role })
      )

      const redirectPath =
        roleRedirectMap[result.role?.toLowerCase()] || '/student'

      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-20">
          <div className="w-full max-w-md">

            <div className="mb-10">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                WELCOME BACK
              </h1>

              <p className="mt-4 text-sm text-gray-500">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              {/* Remember Me */}
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

                <a
                  href="#"
                  className="font-medium text-gray-600 transition hover:text-red-600"
                >
                  Forgot password?
                </a>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Google Login */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                <span className="text-base font-bold">G</span>
                Sign in with Google
              </button>

              {/* Register */}
              <p className="pt-3 text-center text-sm text-gray-600">
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
        <div className="relative hidden lg:block overflow-hidden">

          <img
            src="/images/login-bg.jpeg"
            alt="Login Background"
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />

        </div>
      </div>
    </div>
  )
}
