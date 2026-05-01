import DashboardLayout from '../components/layout/DashboardLayout'
import { students } from '../data/dummyData'

export default function MentorDashboard() {
  return <DashboardLayout><div className="glass rounded-2xl p-4"><h3 className="font-semibold mb-2">Assigned Students</h3><ul className="space-y-2">{students.map(s => <li key={s.id} className="p-2 rounded-xl bg-white/70">{s.name} - {s.division}</li>)}</ul></div><div className="grid md:grid-cols-2 gap-4"><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Logbook Validation</h3><p className="text-sm mt-2">Approve/reject entries with notes.</p></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Activity Monitoring</h3><p className="text-sm mt-2">Track attendance, tasks, and mentor comments.</p></div></div></DashboardLayout>
}
