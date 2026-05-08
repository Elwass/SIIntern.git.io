import DashboardLayout from '../components/layout/DashboardLayout'

const sectionContent = {
  applications: {
    title: 'Pendaftaran Magang',
    description: 'Form pengajuan bidang dan periode magang mahasiswa DPRD Kabupaten Banyumas.',
    action: 'Data pendaftaran akan tersimpan melalui endpoint /api/student/applications.',
  },
  profile: {
    title: 'Data Diri',
    description: 'Lengkapi identitas mahasiswa, kampus, program studi, kontak, dan alamat.',
    action: 'Data diri akan tersinkron dengan endpoint /api/student/profile.',
  },
  documents: {
    title: 'Dokumen',
    description: 'Kelola surat pengantar kampus, CV, KTM, transkrip nilai, dan pas foto.',
    action: 'Upload dan penghapusan dokumen menggunakan endpoint /api/student/documents.',
  },
  logbooks: {
    title: 'Logbook Harian',
    description: 'Catat aktivitas harian magang untuk divalidasi mentor.',
    action: 'Logbook harian menggunakan endpoint /api/student/logbooks.',
  },
  schedule: {
    title: 'Jadwal / Kegiatan',
    description: 'Pantau agenda kegiatan, orientasi, rapat, dan batas waktu laporan.',
    action: 'Jadwal akan ditampilkan setelah admin menetapkan agenda magang.',
  },
  mentor: {
    title: 'Mentor',
    description: 'Informasi mentor pembimbing dan unit kerja penempatan.',
    action: 'Data mentor dibaca dari endpoint /api/student/mentor.',
  },
  assessments: {
    title: 'Penilaian',
    description: 'Lihat hasil evaluasi mentor dan status penilaian akhir.',
    action: 'Penilaian tersedia melalui endpoint /api/student/assessments.',
  },
  final_report: {
    title: 'Laporan Akhir',
    description: 'Kelola status laporan akhir dan dokumen keluaran magang.',
    action: 'Fitur unggah laporan akhir siap dihubungkan setelah skema dokumen final tersedia.',
  },
  notifications: {
    title: 'Notifikasi',
    description: 'Informasi verifikasi berkas, status seleksi, dan catatan mentor/admin.',
    action: 'Notifikasi dibaca dari endpoint /api/student/notifications.',
  },
}

export default function StudentSectionPage({ section }) {
  const content = sectionContent[section] || sectionContent.applications

  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">DPRD Kabupaten Banyumas</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{content.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{content.description}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 text-sm text-red-900">
          {content.action}
        </div>
      </div>
    </DashboardLayout>
  )
}
