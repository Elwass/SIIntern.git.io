import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { applicationStatusLabels, documentStatusLabels, getMentorApplication, listMentorApplications } from '../services/applications'

export default function MentorApplicationsPage() {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { listMentorApplications().then(setRows).catch((err) => setError(err.message)) }, [])
  const loadDetail = (id) => getMentorApplication(id).then((detail) => setSelected({ ...detail.application, ...detail.profile, documents: detail.documents || [] })).catch((err) => setError(err.message))

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Mahasiswa Bimbingan</h1>
        <p className="mt-2 text-sm text-slate-600">Daftar mahasiswa magang yang sudah diterima dan ditetapkan oleh admin sebagai bimbingan mentor.</p>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </section>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          {rows.length === 0 ? <p className="text-sm text-slate-600">Belum ada mahasiswa bimbingan.</p> : rows.map((row) => <button key={row.id} onClick={() => loadDetail(row.id)} className="mb-2 block w-full rounded-2xl border p-4 text-left text-sm hover:bg-red-50"><span className="font-semibold text-slate-950">{row.namaLengkap}</span><p className="text-slate-600">{row.bidangMagang}</p></button>)}
        </section>
        {selected && <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-950">{selected.namaLengkap}</h2><p className="mt-1 text-sm text-slate-600">{selected.nim} • {selected.kampus} • {applicationStatusLabels[selected.status]}</p><div className="mt-4 grid gap-2 text-sm md:grid-cols-2"><p><b>Program Studi:</b> {selected.programStudi}</p><p><b>Periode:</b> {selected.periodeMulai} s.d. {selected.periodeSelesai}</p><p className="md:col-span-2"><b>Bidang:</b> {selected.bidangMagang}</p><p className="md:col-span-2"><b>Alamat:</b> {selected.alamat}</p></div><h3 className="mt-5 font-bold">Dokumen</h3><div className="mt-2 space-y-2">{selected.documents.map((doc) => <div key={doc.id} className="rounded-2xl border p-3 text-sm"><a href={doc.fileUrl} className="font-semibold text-red-700">{doc.jenisDokumen}</a><p className="text-slate-500">{doc.fileName} • {documentStatusLabels[doc.status]}</p></div>)}</div></section>}
      </div>
    </DashboardLayout>
  )
}
