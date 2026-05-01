import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'

export default function ReportPage() {
  return <DashboardLayout><div className="glass rounded-2xl p-5 space-y-3"><h3 className="font-semibold">Evaluation & Report Generation</h3><p className="text-sm">Compile attendance, logbook validation, mentor scoring, and feedback.</p><div className="grid md:grid-cols-2 gap-3"><input className="rounded-xl p-3 border" placeholder="Student Name" /><input className="rounded-xl p-3 border" placeholder="Final Score" /></div><textarea className="w-full rounded-xl p-3 border" rows="4" placeholder="Feedback"></textarea><Button>Generate PDF Report</Button></div></DashboardLayout>
}
