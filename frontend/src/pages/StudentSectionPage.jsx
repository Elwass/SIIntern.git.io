import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  attendanceStatusLabels,
  createStudentLogbook,
  deleteStudentLogbook,
  getCurrentStudentApplication,
  getStudentEvaluation,
  listStudentAttendance,
  listStudentLogbooks,
  listStudentNotifications,
  logbookStatusLabels,
  studentCheckIn,
  studentCheckOut,
} from '../services/applications'

function EmptyState({ children }) {
  return <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 text-sm text-red-900">{children}</div>
}

function Field({ label, value }) { return <p><b>{label}:</b> {value || '-'}</p> }

export default function StudentSectionPage({ section }) {
  const [current, setCurrent] = useState(null)
  const [rows, setRows] = useState([])
  const [evaluation, setEvaluation] = useState(null)
  const [form, setForm] = useState({ activityDate: new Date().toISOString().slice(0, 10), title: '', description: '', output: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const application = current?.application

  const load = async () => {
    setError('')
    const data = await getCurrentStudentApplication()
    setCurrent(data)
    if (!data?.application?.id) return
    if (section === 'logbooks') setRows((await listStudentLogbooks(data.application.id)).data || [])
    if (section === 'schedule' || section === 'attendance') setRows((await listStudentAttendance(data.application.id)).data || [])
    if (section === 'assessments') setEvaluation((await getStudentEvaluation(data.application.id)).data)
    if (section === 'notifications') setRows((await listStudentNotifications()).data || [])
  }

  useEffect(() => { load().catch((err) => setError(err.message)) }, [section])

  const submitLogbook = async (event) => {
    event.preventDefault()
    await createStudentLogbook(application.id, form)
    setForm({ activityDate: new Date().toISOString().slice(0, 10), title: '', description: '', output: '' })
    setMessage('Logbook berhasil disimpan dan dikirim ke mentor.')
    await load()
  }

  const attendanceAction = async (mode) => {
    if (mode === 'in') await studentCheckIn(application.id)
    else await studentCheckOut(application.id)
    setMessage(mode === 'in' ? 'Check-in berhasil.' : 'Check-out berhasil.')
    await load()
  }

  const titleMap = {
    profile: 'Data Diri', documents: 'Dokumen', logbooks: 'Logbook Harian', schedule: 'Absensi', attendance: 'Absensi', mentor: 'Mentor', assessments: 'Penilaian', final_report: 'Laporan', notifications: 'Notifikasi',
  }

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">DPRD Kabupaten Banyumas</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{titleMap[section] || 'Mahasiswa'}</h1>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
        {!application && <EmptyState>Lengkapi pendaftaran magang terlebih dahulu agar fitur operasional dapat digunakan.</EmptyState>}
      </section>

      {application && section === 'profile' && <section className="rounded-3xl border bg-white p-6 text-sm shadow-sm"><div className="grid gap-3 md:grid-cols-2"><Field label="Nama" value={current.profile?.namaLengkap} /><Field label="NIM" value={current.profile?.nim} /><Field label="Kampus" value={current.profile?.kampus} /><Field label="Program Studi" value={current.profile?.programStudi} /><Field label="Semester" value={current.profile?.semester} /><Field label="No. HP" value={current.profile?.noHp} /><Field label="Alamat" value={current.profile?.alamat} /></div></section>}

      {application && section === 'documents' && <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="grid gap-3 md:grid-cols-2">{(current.documents || []).map((doc) => <a key={doc.id} href={doc.fileUrl} className="rounded-2xl border p-4 text-sm hover:bg-red-50"><b>{doc.jenisDokumen}</b><p className="text-slate-600">{doc.fileName}</p><p className="font-semibold text-red-700">{doc.status}</p><p className="text-slate-500">{doc.catatanAdmin}</p></a>)}</div></section>}

      {application && section === 'logbooks' && <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={submitLogbook} className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Tambah Logbook</h2><input type="date" value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} className="mt-3 w-full rounded-xl border p-3" /><input placeholder="Judul kegiatan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-3 w-full rounded-xl border p-3" /><textarea placeholder="Deskripsi aktivitas" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-xl border p-3" /><textarea placeholder="Output/hasil" value={form.output} onChange={(e) => setForm({ ...form, output: e.target.value })} className="mt-3 w-full rounded-xl border p-3" /><button className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">Simpan</button></form><div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-3xl border bg-white p-5 text-sm shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{row.title}</h3><p className="text-slate-500">{row.activityDate} • {logbookStatusLabels[row.status]}</p></div><button onClick={() => deleteStudentLogbook(application.id, row.id).then(load)} className="text-red-700">Hapus</button></div><p className="mt-2 text-slate-700">{row.description}</p>{row.feedback && <p className="mt-2 rounded-xl bg-slate-50 p-3">Feedback: {row.feedback}</p>}</article>)}</div></section>}

      {application && (section === 'schedule' || section === 'attendance') && <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex gap-3"><button onClick={() => attendanceAction('in')} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">Check-in</button><button onClick={() => attendanceAction('out')} className="rounded-xl border px-4 py-2 text-sm font-semibold">Check-out</button></div><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Tanggal</th><th>Status</th><th>Masuk</th><th>Keluar</th><th>Catatan</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b"><td className="py-2">{row.attendanceDate}</td><td>{attendanceStatusLabels[row.status]}</td><td>{row.checkInAt || '-'}</td><td>{row.checkOutAt || '-'}</td><td>{row.notes || '-'}</td></tr>)}</tbody></table></div></section>}

      {application && section === 'mentor' && <section className="rounded-3xl border bg-white p-6 text-sm shadow-sm"><Field label="ID Mentor" value={application.mentorId} /><p className="mt-2 text-slate-600">Mentor akan menerima notifikasi saat admin menetapkan pembimbing untuk pendaftaran diterima.</p></section>}

      {application && section === 'assessments' && <section className="rounded-3xl border bg-white p-6 shadow-sm">{evaluation ? <div className="grid gap-3 text-sm md:grid-cols-2"><Field label="Nilai Kinerja" value={evaluation.performanceScore} /><Field label="Soft Skills" value={evaluation.softSkillsScore} /><Field label="Logbook" value={evaluation.logbookScore} /><Field label="Nilai Akhir" value={`${evaluation.finalScore} (${evaluation.grade})`} /><Field label="Feedback" value={evaluation.feedback} /></div> : <EmptyState>Penilaian akhir belum tersedia.</EmptyState>}</section>}

      {application && section === 'final_report' && <section className="rounded-3xl border bg-white p-6 shadow-sm"><a className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white" href={`/api/student/reports/logbook?applicationId=${application.id}&format=csv`}>Unduh Laporan Logbook</a><a className="ml-3 rounded-xl border px-4 py-2 text-sm font-semibold" href={`/api/student/reports/attendance?applicationId=${application.id}&format=csv`}>Unduh Absensi</a></section>}

      {section === 'notifications' && <section className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-3xl border bg-white p-5 text-sm shadow-sm"><h3 className="font-bold text-slate-950">{row.title}</h3><p className="mt-1 text-slate-600">{row.message}</p><p className="mt-2 text-xs text-slate-400">{row.createdAt}</p></article>)}</section>}
    </DashboardLayout>
  )
}
