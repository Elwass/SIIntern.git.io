import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="space-y-4 overflow-hidden">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  )
}
