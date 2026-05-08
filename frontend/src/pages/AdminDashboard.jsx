import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Dashboard Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Pengelolaan Pendaftaran Magang</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Gunakan menu Pendaftaran Magang untuk melihat data yang masuk dari database, memverifikasi dokumen, mengubah status, dan menetapkan mentor.
        </p>
        <Link to="/admin/applications" className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800">
          Buka Pendaftaran Magang
        </Link>
      </section>
    </DashboardLayout>
  )
}
