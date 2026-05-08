import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  applicationStatusLabels,
  createStudentApplication,
  deleteStudentDocument,
  documentStatusLabels,
  getApplicationOptions,
  getCurrentStudentApplication,
  submitStudentApplication,
  updateStudentApplication,
  uploadStudentDocument,
} from '../services/applications'

const emptyForm = {
  namaLengkap: '', nim: '', kampus: '', programStudi: '', semester: '', email: '', noHp: '', alamat: '',
  bidangMagang: '', periodeMulai: '', periodeSelesai: '', motivasi: '',
}

function canEdit(status) { return !status || ['draft', 'needs_revision'].includes(status) }
function statusText(status) { return applicationStatusLabels[status] || 'Belum Ada Pendaftaran' }

export default function StudentApplicationPage() {
  const [options, setOptions] = useState({ internshipFields: [], requiredDocumentTypes: [] })
  const [application, setApplication] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const editable = canEdit(application?.status)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [optionData, current] = await Promise.all([getApplicationOptions(), getCurrentStudentApplication()])
      setOptions(optionData)
      setApplication(current)
      setForm(current ? {
        namaLengkap: current.namaLengkap || '', nim: current.nim || '', kampus: current.kampus || '', programStudi: current.programStudi || '',
        semester: current.semester || '', email: current.email || '', noHp: current.noHp || '', alamat: current.alamat || '',
        bidangMagang: current.bidangMagang || '', periodeMulai: current.periodeMulai || '', periodeSelesai: current.periodeSelesai || '', motivasi: current.motivasi || '',
      } : emptyForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const saveDraft = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const result = application ? await updateStudentApplication(application.id, form) : await createStudentApplication(form)
      setApplication(result)
      setSuccess('Draft pendaftaran berhasil disimpan.')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const submitApplication = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const saved = application ? await updateStudentApplication(application.id, form) : await createStudentApplication(form)
      const submitted = await submitStudentApplication(saved.id)
      setApplication(submitted)
      setSuccess('Pendaftaran berhasil diajukan dan menunggu verifikasi admin.')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const handleFile = async (jenisDokumen, file) => {
    if (!file || !application) return
    setError(''); setSuccess('')
    try {
      await uploadStudentDocument(application.id, { jenisDokumen, fileName: file.name, fileSize: file.size, mimeType: file.type })
      setSuccess(`${jenisDokumen} berhasil diunggah.`)
      await loadData()
    } catch (err) { setError(err.message) }
  }

  const removeDocument = async (documentId) => {
    setError(''); setSuccess('')
    try { await deleteStudentDocument(application.id, documentId); await loadData() } catch (err) { setError(err.message) }
  }

  if (loading) return <DashboardLayout><div className="rounded-3xl bg-white p-6 shadow-sm">Memuat pendaftaran...</div></DashboardLayout>

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Pendaftaran Magang</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Form Pendaftaran Magang DPRD Kabupaten Banyumas</h1>
            <p className="mt-2 text-sm text-slate-600">Lengkapi data, unggah dokumen wajib, lalu ajukan pendaftaran untuk diverifikasi admin.</p>
          </div>
          <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{statusText(application?.status)}</span>
        </div>
        {application?.catatanAdmin && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Catatan admin: {application.catatanAdmin}</div>}
        {error && <div role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            ['namaLengkap', 'Nama Lengkap'], ['nim', 'NIM'], ['kampus', 'Kampus'], ['programStudi', 'Program Studi'],
            ['semester', 'Semester'], ['email', 'Email'], ['noHp', 'Nomor HP'], ['alamat', 'Alamat'],
          ].map(([field, label]) => (
            <label key={field} className="text-sm font-semibold text-slate-700">
              {label}
              <input disabled={!editable} value={form[field]} onChange={updateField(field)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50" />
            </label>
          ))}
          <label className="text-sm font-semibold text-slate-700">
            Bidang Magang
            <select disabled={!editable} value={form.bidangMagang} onChange={updateField('bidangMagang')} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50">
              <option value="">Pilih bidang magang</option>
              {options.internshipFields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Periode Mulai<input disabled={!editable} type="date" value={form.periodeMulai} onChange={updateField('periodeMulai')} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50" /></label>
          <label className="text-sm font-semibold text-slate-700">Periode Selesai<input disabled={!editable} type="date" value={form.periodeSelesai} onChange={updateField('periodeSelesai')} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50" /></label>
          <label className="md:col-span-2 text-sm font-semibold text-slate-700">Motivasi / Alasan Mendaftar<textarea disabled={!editable} value={form.motivasi} onChange={updateField('motivasi')} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50" /></label>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-950">Dokumen Pendaftaran</h2>
          {!application && <p className="mt-2 text-sm text-slate-600">Simpan draft terlebih dahulu sebelum mengunggah dokumen.</p>}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {options.requiredDocumentTypes.map((type) => {
              const document = application?.documents?.find((item) => item.jenisDokumen === type)
              return (
                <div key={type} className="rounded-2xl border border-slate-100 p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold text-slate-950">{type}</p>{document && <p className="mt-1 text-slate-500">{document.fileName} • {documentStatusLabels[document.status]}</p>}{document?.catatanAdmin && <p className="mt-1 text-amber-700">Catatan: {document.catatanAdmin}</p>}</div>
                    {document && editable && <button type="button" onClick={() => removeDocument(document.id)} className="text-xs font-semibold text-red-700">Hapus</button>}
                  </div>
                  {application && editable && <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(type, event.target.files?.[0])} className="mt-3 w-full text-xs" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {editable && <button type="button" disabled={saving} onClick={saveDraft} className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Simpan Draft</button>}
          {editable && <button type="button" disabled={saving} onClick={submitApplication} className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800">Ajukan Pendaftaran</button>}
          <button type="button" onClick={loadData} className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batalkan Perubahan</button>
        </div>
      </section>
    </DashboardLayout>
  )
}
