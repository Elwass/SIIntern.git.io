import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'

export default function ReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Penilaian dan Laporan Akhir Magang</h3>
        <p className="text-sm text-slate-600">Susun rekap logbook, validasi mentor, nilai akhir, dan umpan balik program magang DPRD Kabupaten Banyumas.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" placeholder="Nama Mahasiswa" />
          <input className="rounded-xl border p-3" placeholder="Nilai Akhir" />
        </div>
        <textarea className="w-full rounded-xl border p-3" rows="4" placeholder="Catatan penilaian mentor/admin" />
        <Button>Siapkan Laporan</Button>
      </div>
    </DashboardLayout>
  )
}
