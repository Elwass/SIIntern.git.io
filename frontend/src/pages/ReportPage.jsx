import DashboardLayout from '../components/layout/DashboardLayout'
import { exportReportUrl } from '../services/applications'
import { getStoredSession } from '../services/auth'

export default function ReportPage() {
  const role = (getStoredSession()?.role || 'admin').toLowerCase() === 'student' ? 'student' : (getStoredSession()?.role || 'admin').toLowerCase() === 'mentor' ? 'mentor' : 'admin'
  const reports = [
    ['applications', 'Pendaftaran', '/admin/applications'],
    ['documents', 'Dokumen', exportReportUrl(role, 'documents')],
    ['logbook', 'Logbook', exportReportUrl(role, 'logbook')],
    ['attendance', 'Absensi', exportReportUrl(role, 'attendance')],
  ]
  return <DashboardLayout><section className="rounded-3xl border bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold text-slate-950">Laporan & Export</h1><p className="mt-2 text-sm text-slate-600">Unduh laporan CSV yang dapat dibuka di Excel. Endpoint yang sama menerima format=json untuk integrasi API.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{reports.map(([type, label, href]) => <a key={type} href={href} className="rounded-2xl border p-5 text-sm font-semibold hover:bg-red-50">Export {label}</a>)}</div></section></DashboardLayout>
}
