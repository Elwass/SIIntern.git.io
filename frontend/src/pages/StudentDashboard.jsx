import DashboardLayout from '../components/layout/DashboardLayout'

export default function StudentDashboard() {
  return <DashboardLayout><div className="grid md:grid-cols-3 gap-4"><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Attendance</h3><p className="text-accent">Present (QR/GPS placeholder)</p></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Logbook Progress</h3><p>18 / 22 entries completed</p></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Productivity Score</h3><p>89 / 100</p></div></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">AI Weekly Summary</h3><p className="text-sm">Consistent attendance, improved report writing, suggestion: increase stakeholder meeting notes detail.</p></div></DashboardLayout>
}
