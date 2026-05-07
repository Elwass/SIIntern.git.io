


Pasted text(22).txt
Document
biar nggak ada garis putihnya biar clean mana yang perlu diubah 

Generated image: Logo guidelines and final design


Edit



Pasted text(23).txt
Document
kamu kelaur topik, aku nyuruh sesuainkan kodenya baird garis putih dan cardnya hilang jadi clean tampilanya 

Yang bikin ada “garis putih” dan kesan nggak clean itu bagian kanan ini: 


<div className="relative hidden overflow-hidden lg:block lg:rounded-l-[2rem] lg:shadow-xl lg:shadow-gray-300/40">
dan ini:

<div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white/35 to-transparent" />
<div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white/75 to-transparent" />
Itu bikin efek glow/garis putih di sisi kiri image.

Terus card putih login ini juga bikin tampilannya kurang clean:

<div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl shadow-gray-200/50">
Ubah jadi transparan tanpa card.

Ganti section render return jadi kayak gini:

return (
  <div className="min-h-screen bg-black">
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

      {/* LEFT */}
      <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-16 bg-black">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-wide text-white">
            WELCOME BACK
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>

              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>

              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <a href="#" className="text-gray-400 hover:text-white">
                Forgot password
              </a>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative hidden lg:block">
        <div className="h-full w-full bg-[url('/images/login-bg.jpeg')] bg-cover bg-center" />

        {/* overlay gelap tipis */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

    </div>
  </div>
)
Hasilnya:

nggak ada garis putih

nggak ada card putih

full clean modern

kiri menyatu dengan background

lebih premium/minimalis

image kanan jadi seamless tanpa glow putih lagi


berikan fullnya 

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Login failed. Please check your credentials.')
  }

  localStorage.setItem('token', result.token)
  localStorage.setItem('role', result.role)
  localStorage.setItem('user', JSON.stringify(result.user || { email, role: result.role }))

  const redirectPath = roleRedirectMap[result.role?.toLowerCase()] || '/student'
  navigate(redirectPath, { replace: true })
} catch (err) {
  setError(err.message || 'Something went wrong. Please try again.')
} finally {
  setLoading(false)
}
}

return (




WELCOME BACK
Welcome back! Please enter your details.

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="text-gray-600 hover:underline">Forgot password</a>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <span aria-hidden="true">G</span>
            Sign in with Google
          </button>

          <p className="pt-2 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>

    <div className="relative hidden overflow-hidden lg:block lg:rounded-l-[2rem] lg:shadow-xl lg:shadow-gray-300/40">
      <div className="h-full w-full bg-[url('/images/login-bg.jpeg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white/35 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white/75 to-transparent" />
    </div>
  </div>
</div>
)
}


Close
