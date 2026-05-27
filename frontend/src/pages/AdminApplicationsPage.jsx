import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  applicationStatusLabels,
  assignApplicationMentor,
  documentStatusLabels,
  getAdminApplication,
  listMentorUsers,
  listAdminApplications,
  resolveFileUrl,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
} from '../services/applications'

const statuses = ['', 'pending', 'verified', 'accepted', 'rejected']

export default function AdminApplicationsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', bidang_magang: '' })
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [mentorId, setMentorId] = useState('')
  const [error, setError] = useState('')
  const [mentorOptions, setMentorOptions] = useState([])

  const loadRows = async () => {
    try {
      const result = await listAdminApplications(filters)
      const deduplicated = Object.values(result.data.reduce((accumulator, row) => {
        const key = `${row.userId}-${row.periodeMulai}-${row.periodeSelesai}`
        if (!accumulator[key] || new Date(row.createdAt) > new Date(accumulator[key].createdAt)) accumulator[key] = row
        return accumulator
      }, {}))
      setRows(deduplicated)
      if (deduplicated[0] && !selected) loadDetail(deduplicated[0].id)
    } catch (err) { setError(err.message) }
  }
  const loadDetail = async (id) => {
    try {
      const detail = await getAdminApplication(id)
      setSelected({ ...detail.application, ...detail.profile, email: detail.user?.email || '', documents: detail.documents || [], mentors: detail.mentors || [], mentor: detail.mentor })
      setNote('')
    } catch (err) { setError(err.message) }
  }
  useEffect(() => {
    loadRows()
    listMentorUsers().then((result) => setMentorOptions(result.data || [])).catch((err) => setError(err.message))
  }, [])

  const changeStatus = async (status) => {
    try { const result = await updateAdminApplicationStatus(selected.id, { status, catatanAdmin: note }); setSelected({ ...result.application, ...result.profile, email: result.user?.email || '', documents: result.documents || [], mentors: result.mentors || [], mentor: result.mentor }); await loadRows() } catch (err) { setError(err.message) }
  }
  const changeDocumentStatus = async (documentId, status) => {
    try { await updateAdminDocumentStatus(selected.id, documentId, { status, catatanAdmin: note }); await loadDetail(selected.id) } catch (err) { setError(err.message) }
  }
  const assignMentor = async () => {
    if (!mentorId) { setError('Pilih mentor terlebih dahulu.'); return }
    try { const result = await assignApplicationMentor(selected.id, Number(mentorId)); setSelected({ ...result.application, ...result.profile, email: result.user?.email || '', documents: result.documents || [], mentors: result.mentors || [], mentor: result.mentor }); await loadRows() } catch (err) { setError(err.message) }
  }

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Review Pendaftaran Magang</h1>
        <p className="mt-2 text-sm text-slate-600">Kelola verifikasi berkas, status pendaftaran, dan penetapan mentor mahasiswa magang.</p>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Cari nama/NIM/email" className="rounded-xl border p-3 text-sm" />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-xl border p-3 text-sm">{statuses.map((status) => <option key={status} value={status}>{status ? applicationStatusLabels[status] : 'Semua Status'}</option>)}</select>
          <input value={filters.bidang_magang} onChange={(e) => setFilters({ ...filters, bidang_magang: e.target.value })} placeholder="Bidang magang" className="rounded-xl border p-3 text-sm" />
          <button onClick={loadRows} className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white">Terapkan Filter</button>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Nama</th><th>NIM</th><th>Bidang</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-slate-600">Belum ada pendaftaran magang yang masuk.</td></tr> : rows.map((row) => <tr key={row.id} className="border-t"><td className="p-3 font-semibold">{row.namaLengkap}<p className="text-xs font-normal text-slate-500">{row.kampus}</p></td><td>{row.nim}</td><td>{row.bidangMagang}</td><td>{applicationStatusLabels[row.status]}</td><td><button onClick={() => loadDetail(row.id)} className="font-semibold text-red-700">Detail</button></td></tr>)}</tbody></table>
        </section>
        {selected && (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-950">{selected.namaLengkap}</h2><p className="text-sm text-slate-600">{selected.nim} • {selected.kampus}</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">{applicationStatusLabels[selected.status]}</span></div>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-2"><p><b>Program Studi:</b> {selected.programStudi}</p><p><b>Email:</b> {selected.email}</p><p><b>HP:</b> {selected.noHp}</p><p><b>Periode:</b> {selected.periodeMulai} s.d. {selected.periodeSelesai}</p><p className="md:col-span-2"><b>Bidang:</b> {selected.bidangMagang}</p><p className="md:col-span-2"><b>Motivasi:</b> {selected.motivasi}</p></div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan admin opsional / catatan dokumen" className="mt-5 w-full rounded-xl border p-3 text-sm" rows="3" />
            <div className="mt-4 flex flex-wrap gap-2">{selected.status === 'pending' && <button onClick={() => changeStatus('verified')} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Verifikasi</button>}{selected.status === 'verified' && <button onClick={() => changeStatus('accepted')} className="rounded-xl bg-red-700 px-3 py-2 text-xs font-semibold text-white">Terima</button>}{['pending', 'verified'].includes(selected.status) && <button onClick={() => changeStatus('rejected')} className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white">Tolak</button>}</div>
            <div className="mt-5"><h3 className="font-bold">Dokumen</h3><div className="mt-2 space-y-2">{selected.documents.map((doc) => <div key={doc.id} className="rounded-2xl border p-3 text-sm"><div className="flex justify-between gap-3"><a href={resolveFileUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="font-semibold text-red-700">{doc.jenisDokumen}</a><span>{documentStatusLabels[doc.status]}</span></div><p className="text-slate-500">{doc.fileName}</p>{doc.catatanAdmin && <p className="text-amber-700">{doc.catatanAdmin}</p>}<div className="mt-2 flex gap-2"><button onClick={() => changeDocumentStatus(doc.id, 'verified')} className="text-xs font-semibold text-emerald-700">Verifikasi</button><button onClick={() => changeDocumentStatus(doc.id, 'needs_revision')} className="text-xs font-semibold text-amber-700">Perbaikan</button><button onClick={() => changeDocumentStatus(doc.id, 'rejected')} className="text-xs font-semibold text-red-700">Tolak</button></div></div>)}</div></div>
            {selected.status === 'accepted' && <div className="mt-5 flex gap-2"><select value={mentorId} onChange={(e) => setMentorId(e.target.value)} className="rounded-xl border p-3 text-sm" disabled={Boolean(selected.mentor?.id)}><option value="">Pilih mentor</option>{mentorOptions.map((mentor) => <option key={mentor.id} value={mentor.id}>{mentor.name}</option>)}</select><button onClick={assignMentor} disabled={Boolean(selected.mentor?.id)} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{selected.mentor?.id ? 'Mentor Ditetapkan' : 'Assign Mentor'}</button></div>}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
