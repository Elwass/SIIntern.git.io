import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { getAdminDashboard } from '../services/applications'

function StatGroup({ title, rows = [] }) {
  return <div className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">{title}</h2><div className="mt-3 grid gap-2">{rows.length === 0 ? <p className="text-sm text-slate-500">Belum ada data.</p> : rows.map((row) => <div key={row.status || row.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>{row.status || row.name}</span><b>{row.total ?? row.student_count ?? 0}</b></div>)}</div></div>
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getAdminDashboard().then((result) => setSummary(result.data)).catch((err) => setError(err.message)) }, [])
  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Dashboard Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Pengelolaan Magang SIIntern</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Pantau pendaftaran, dokumen, kinerja mentor, logbook, dan absensi dengan RBAC dan audit trail backend.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/admin/applications" className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800">Pendaftaran</Link><Link to="/report" className="rounded-xl border px-5 py-3 text-sm font-semibold">Export Laporan</Link></div>
        {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </section>
      {summary && <div className="grid gap-4 lg:grid-cols-2"><StatGroup title="Status Pendaftaran" rows={summary.applications} /><StatGroup title="Status Dokumen" rows={summary.documents} /><StatGroup title="Absensi" rows={summary.attendance} /><StatGroup title="Performa Mentor" rows={summary.mentors} /></div>}
    </DashboardLayout>
  )
}
