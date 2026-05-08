export const internshipFields = [
  'Administrasi Pemerintahan',
  'Sistem Informasi dan Teknologi',
  'Dokumentasi',
  'Hukum dan Kebijakan Publik',
  'Keuangan',
  'Pelayanan Publik',
]

export const requiredDocumentTypes = [
  'Surat Pengantar Kampus',
  'Curriculum Vitae',
  'Kartu Tanda Mahasiswa',
  'Transkrip Nilai',
  'Pas Foto',
]

export const users = [
  { id: 1, name: 'Admin DPRD Banyumas', email: 'admin@dprd.go.id', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Mentor DPRD Banyumas', email: 'mentor@dprd.go.id', password: 'mentor123', role: 'mentor' },
  { id: 3, name: 'Mahasiswa Demo', email: 'student@dprd.go.id', password: 'student123', role: 'student' },
  { id: 4, name: 'Mahasiswa Belum Mengajukan', email: 'mahasiswa.baru@example.com', password: 'student123', role: 'student' },
]

export const studentProfiles = [
  {
    id: 1,
    userId: 3,
    fullName: 'Mahasiswa Demo',
    university: 'Universitas Jenderal Soedirman',
    studyProgram: 'Sistem Informasi',
    studentNumber: 'H1D021001',
    phone: '0812-3456-7890',
    address: 'Purwokerto, Kabupaten Banyumas',
    accountStatus: 'Aktif',
    profileStatus: 'Lengkap',
  },
  {
    id: 2,
    userId: 4,
    fullName: 'Mahasiswa Belum Mengajukan',
    university: '',
    studyProgram: '',
    studentNumber: '',
    phone: '',
    address: '',
    accountStatus: 'Aktif',
    profileStatus: 'Belum Lengkap',
  },
]

export const internshipApplications = [
  {
    id: 1,
    userId: 3,
    field: 'Sistem Informasi dan Teknologi',
    period: 'Juli - September 2026',
    status: 'Menunggu Verifikasi',
    documentVerificationStatus: 'Perlu Perbaikan',
    selectionStatus: 'Belum Seleksi',
    internshipStatus: 'Belum Mulai',
    submittedAt: '2026-05-01',
    notes: 'Lengkapi transkrip nilai untuk proses verifikasi berkas.',
  },
]

export const documents = [
  { id: 1, userId: 3, type: 'Surat Pengantar Kampus', fileName: 'surat-pengantar.pdf', status: 'Terverifikasi', uploadedAt: '2026-05-01' },
  { id: 2, userId: 3, type: 'Curriculum Vitae', fileName: 'cv-mahasiswa-demo.pdf', status: 'Terverifikasi', uploadedAt: '2026-05-01' },
  { id: 3, userId: 3, type: 'Kartu Tanda Mahasiswa', fileName: 'ktm.pdf', status: 'Terverifikasi', uploadedAt: '2026-05-01' },
  { id: 4, userId: 3, type: 'Pas Foto', fileName: 'pas-foto.jpg', status: 'Menunggu Verifikasi', uploadedAt: '2026-05-02' },
]

export const logbooks = [
  {
    id: 1,
    userId: 3,
    date: '2026-05-04',
    activity: 'Orientasi alur administrasi Sekretariat DPRD Kabupaten Banyumas.',
    output: 'Memahami struktur bagian dan tata tertib magang.',
    status: 'Disetujui Mentor',
  },
  {
    id: 2,
    userId: 3,
    date: '2026-05-05',
    activity: 'Membantu rekap dokumen kegiatan komisi dan notulensi rapat.',
    output: 'Draft rekap dokumen kegiatan komisi.',
    status: 'Menunggu Validasi Mentor',
  },
]

export const mentorAssignments = [
  {
    id: 1,
    studentUserId: 3,
    mentorUserId: 2,
    division: 'Bagian Persidangan dan Perundang-undangan',
    startedAt: '2026-05-04',
  },
]

export const assessments = []

export const notifications = [
  {
    id: 1,
    userId: 3,
    title: 'Perbaikan Berkas',
    message: 'Mohon unggah Transkrip Nilai agar pendaftaran dapat diverifikasi.',
    read: false,
    createdAt: '2026-05-03',
  },
]
