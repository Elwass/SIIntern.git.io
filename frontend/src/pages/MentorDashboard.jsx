import DashboardLayout from '../components/layout/DashboardLayout'
import { students } from '../data/dummyData'

export default function MentorDashboard() {
  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Mahasiswa Bimbingan</h3>
        <ul className="mt-3 space-y-2">
          {students.map((student) => (
            <li key={student.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-950">{student.name}</span> — {student.division}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Validasi Logbook</h3>
          <p className="mt-2 text-sm text-slate-600">Mentor memeriksa aktivitas harian, output kegiatan, dan memberikan catatan pembimbing.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Monitoring Kegiatan</h3>
          <p className="mt-2 text-sm text-slate-600">Pantau progres pelaksanaan magang, dokumen, dan kesiapan penilaian akhir mahasiswa.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
