import DashboardLayout from '../components/layout/DashboardLayout'
import KPICard from '../components/common/KPICard'
import ActivityChart from '../components/charts/ActivityChart'
import { kpis, trendData, students } from '../data/dummyData'

export default function AdminDashboard() {
  return <DashboardLayout><div className="grid md:grid-cols-3 gap-4">{kpis.map(k => <KPICard key={k.title} {...k} />)}</div><ActivityChart data={trendData} /><div className="grid md:grid-cols-3 gap-4"><div className="glass p-4 rounded-2xl md:col-span-2"><h3 className="font-semibold mb-3">Recent Activity</h3><table className="w-full text-sm"><thead><tr className="text-left"><th>Name</th><th>Division</th><th>Status</th></tr></thead><tbody>{students.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.division}</td><td>{s.status}</td></tr>)}</tbody></table></div><div className="glass p-4 rounded-2xl"><h3 className="font-semibold">Notifications</h3><ul className="text-sm mt-2 list-disc pl-4"><li>5 logbooks pending validation</li><li>Monthly report due Friday</li></ul></div></div></DashboardLayout>
}
