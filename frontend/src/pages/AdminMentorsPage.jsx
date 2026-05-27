import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { createMentor, deleteMentor, listMentors, updateMentor } from '../services/applications'

const emptyForm = { name: '', email: '', bidang: '', nimNip: '', password: '', status: 'active' }

export default function AdminMentorsPage() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadMentors = async () => {
    try {
      setRows((await listMentors()).data || [])
    } catch (err) { setError(err.message) }
  }

  useEffect(() => { loadMentors() }, [])

  const submit = async () => {
    setError(''); setSuccess('')
    try {
      if (!form.name || !form.email || (!editingId && !form.password)) throw new Error('Nama, email, dan password mentor wajib diisi.')
      if (editingId) {
        await updateMentor(editingId, form)
        setSuccess('Mentor berhasil diperbarui.')
      } else {
        await createMentor(form)
        setSuccess('Mentor berhasil ditambahkan.')
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadMentors()
    } catch (err) { setError(err.message) }
  }

  const startEdit = (mentor) => {
    setEditingId(mentor.id)
    setForm({ name: mentor.name || '', email: mentor.email || '', bidang: mentor.bidang || '', nimNip: mentor.nimNip || '', password: '', status: mentor.status || 'active' })
  }

  const removeMentor = async (id) => {
    setError(''); setSuccess('')
    try { await deleteMentor(id); setSuccess('Mentor berhasil dihapus.'); await loadMentors() } catch (err) { setError(err.message) }
  }

  return (
    <DashboardLayout>
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Manajemen Mentor</h1>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border p-3 text-sm" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border p-3 text-sm" />
          <input placeholder="NIM/NIP" value={form.nimNip} onChange={(e) => setForm({ ...form, nimNip: e.target.value })} className="rounded-xl border p-3 text-sm" />
          <input placeholder="Bidang" value={form.bidang} onChange={(e) => setForm({ ...form, bidang: e.target.value })} className="rounded-xl border p-3 text-sm" />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl border p-3 text-sm" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="active">Aktif</option><option value="blocked">Nonaktif</option></select>
        </div>
        <div className="mt-4 flex gap-2"><button onClick={submit} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Mentor' : 'Tambah Mentor'}</button>{editingId && <button onClick={() => { setEditingId(null); setForm(emptyForm) }} className="rounded-xl border px-4 py-2 text-sm">Batal</button>}</div>
      </section>
      <section className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Nama</th><th>Email</th><th>NIM/NIP</th><th>Bidang</th><th>Status Aktif</th><th>Aksi</th></tr></thead>
          <tbody>{rows.map((mentor) => <tr key={mentor.id} className="border-t"><td className="p-3 font-semibold">{mentor.name}</td><td>{mentor.email}</td><td>{mentor.nimNip || '-'}</td><td>{mentor.bidang || '-'}</td><td>{mentor.status || 'active'}</td><td className="space-x-2"><button onClick={() => startEdit(mentor)} className="font-semibold text-blue-700">Edit</button><button onClick={() => removeMentor(mentor.id)} className="font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table>
      </section>
    </DashboardLayout>
  )
}
