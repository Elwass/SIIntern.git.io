import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="p-4 md:p-6 grid md:grid-cols-[16rem_1fr] gap-4">
      <Sidebar />
      <main className="space-y-4">
        <Topbar />
        {children}
      </main>
    </div>
  )
}
