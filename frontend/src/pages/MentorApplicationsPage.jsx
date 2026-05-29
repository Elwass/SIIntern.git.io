import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { applicationStatusLabels, attendanceStatusLabels, documentStatusLabels, getMentorApplication, listMentorApplications, listMentorAttendance, listMentorLogbooks, reviewMentorLogbook, upsertMentorAttendance, upsertMentorEvaluation } from '../services/applications'

export default function MentorApplicationsPage() {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [logbooks, setLogbooks] = useState([])
  const [attendance, setAttendance] = useState([])
  const [scores, setScores] = useState({ performanceScore: 85, softSkillsScore: 85, logbookScore: 85, feedback: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { listMentorApplications().then(setRows).catch((err) => setError(err.message)) }, [])
  const loadDetail = async (id) => {
    setError('')
    const detail = await getMentorApplication(id)
    setSelected({ ...detail.application, ...detail.profile, documents: detail.documents || [] })
    setLogbooks((await listMentorLogbooks({ applicationId: id })).data || [])
    setAttendance((await listMentorAttendance(id)).data || [])
  }
  const reviewLogbook = async (row, status) => {
    await reviewMentorLogbook(row.applicationId, row.id, { status, feedback: status === 'approved' ? 'Disetujui mentor.' : 'Mohon perbaiki detail aktivitas.' })
    setMessage('Status logbook diperbarui.')
    await loadDetail(row.applicationId)
  }
  const inputAttendance = async () => {
    await upsertMentorAttendance(selected.id, { attendanceDate: new Date().toISOString().slice(0, 10), status: 'present', notes: 'Diinput mentor.' })
    setMessage('Absensi hari ini disimpan.')
    await loadDetail(selected.id)
  }
  const submitEvaluation = async (event) => {
    event.preventDefault()
    await upsertMentorEvaluation(selected.id, scores)
    setMessage('Penilaian akhir berhasil disimpan dan dikirim ke mahasiswa.')
  }

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Mahasiswa Bimbingan</h1>
        <p className="mt-2 text-sm text-slate-600">Review dokumen, verifikasi logbook, input absensi, dan penilaian akhir mahasiswa bimbingan.</p>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      </section>
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          {rows.length === 0 ? <p className="text-sm text-slate-600">Belum ada mahasiswa bimbingan.</p> : rows.map((row) => <button key={row.id} onClick={() => loadDetail(row.id)} className="mb-2 block w-full rounded-2xl border p-4 text-left text-sm hover:bg-red-50"><span className="font-semibold text-slate-950">{row.namaLengkap}</span><p className="text-slate-600">{row.bidangMagang}</p></button>)}
        </section>
        {selected && <section className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-950">{selected.namaLengkap}</h2><p className="mt-1 text-sm text-slate-600">{selected.nim} • {selected.kampus} • {applicationStatusLabels[selected.status]}</p><div className="mt-4 grid gap-2 text-sm md:grid-cols-2"><p><b>Program Studi:</b> {selected.programStudi}</p><p><b>Periode:</b> {selected.periodeMulai} s.d. {selected.periodeSelesai}</p><p className="md:col-span-2"><b>Bidang:</b> {selected.bidangMagang}</p></div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-bold">Dokumen</h3><div className="mt-2 grid gap-2 md:grid-cols-2">{selected.documents.map((doc) => <div key={doc.id} className="rounded-2xl border p-3 text-sm"><a href={doc.fileUrl} className="font-semibold text-red-700">{doc.jenisDokumen}</a><p className="text-slate-500">{doc.fileName} • {documentStatusLabels[doc.status]}</p></div>)}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-bold">Logbook Pending</h3><div className="mt-2 space-y-2">{logbooks.map((row) => <div key={row.id} className="rounded-2xl border p-3 text-sm"><b>{row.activityDate} — {row.title}</b><p>{row.description}</p><p className="text-slate-500">{row.status}</p>{row.status === 'pending' && <div className="mt-2 flex gap-2"><button onClick={() => reviewLogbook(row, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-1 text-white">Setujui</button><button onClick={() => reviewLogbook(row, 'rejected')} className="rounded-lg bg-red-700 px-3 py-1 text-white">Tolak</button></div>}</div>)}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Absensi</h3><button onClick={inputAttendance} className="rounded-xl bg-red-700 px-3 py-2 text-sm font-semibold text-white">Input Hadir Hari Ini</button></div><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{attendance.map((row) => <tr key={row.id} className="border-b"><td className="py-2">{row.attendanceDate}</td><td>{attendanceStatusLabels[row.status]}</td><td>{row.notes}</td></tr>)}</tbody></table></div></div>
          <form onSubmit={submitEvaluation} className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-bold">Penilaian Akhir</h3><div className="mt-3 grid gap-3 md:grid-cols-3">{['performanceScore', 'softSkillsScore', 'logbookScore'].map((key) => <input key={key} type="number" min="0" max="100" value={scores[key]} onChange={(e) => setScores({ ...scores, [key]: e.target.value })} className="rounded-xl border p-3" />)}</div><textarea value={scores.feedback} onChange={(e) => setScores({ ...scores, feedback: e.target.value })} placeholder="Feedback akhir" className="mt-3 w-full rounded-xl border p-3" /><button className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">Simpan Nilai</button></form>
        </section>}
      </div>
    </DashboardLayout>
  )
}
