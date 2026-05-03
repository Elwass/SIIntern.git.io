export default function Topbar() {
  return (
    <header className="glass rounded-2xl px-5 py-3 flex justify-between items-center">
      <p className="font-semibold">Secretariat DPRD Banyumas Internship Dashboard</p>
      <div className="flex items-center gap-3">
        <span className="text-sm">🔔</span>
        <span className="text-sm font-medium">Admin Profile</span>
      </div>
    </header>
  )
}
