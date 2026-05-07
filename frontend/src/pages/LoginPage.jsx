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
    <div className="min-h-screen bg-black">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-16 bg-black">
          <div className="w-full max-w-md">

            <h1 className="text-3xl font-bold tracking-wide text-white">
              WELCOME BACK
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Welcome back! Please enter your details.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    text-white
                    placeholder:text-gray-500
                    focus:border-red-500
                    focus:outline-none
                  "
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    text-white
                    placeholder:text-gray-500
                    focus:border-red-500
                    focus:outline-none
                  "
                />
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-red-500"
                  />

                  Remember me
                </label>

                <a
                  href="#"
                  className="text-gray-400 transition hover:text-white"
                >
                  Forgot password
                </a>
              </div>

              {/* ERROR */}
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* GOOGLE BUTTON */}
              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                <span aria-hidden="true">G</span>
                Sign in with Google
              </button>

              {/* REGISTER */}
              <p className="pt-2 text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}

                <Link
                  to="/register"
                  className="font-medium text-white hover:underline"
                >
                  Sign up
                </Link>
              </p>

            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden lg:block overflow-hidden">

          <div className="h-full w-full bg-[url('/images/login-bg.jpeg')] bg-cover bg-center" />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/30" />

        </div>
      </div>
    </div>
  )
}
