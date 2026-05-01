import Button from '../components/ui/Button'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form className="glass rounded-2xl w-full max-w-md p-8 space-y-4">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <input className="w-full rounded-xl p-3 bg-white/80 border" placeholder="Email" />
        <input className="w-full rounded-xl p-3 bg-white/80 border" placeholder="Password" type="password" />
        <Button className="w-full">Login</Button>
      </form>
    </div>
  )
}
