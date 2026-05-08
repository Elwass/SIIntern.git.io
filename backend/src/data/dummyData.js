export const applicationStatuses = ['draft', 'submitted', 'needs_revision', 'verified', 'accepted', 'rejected', 'cancelled']

export const documentStatuses = ['uploaded', 'verified', 'needs_revision', 'rejected']

export const internshipFields = [
  'Administrasi Pemerintahan',
  'Sistem Informasi dan Teknologi',
  'Pengelolaan Data dan Dokumentasi',
  'Hukum dan Kebijakan Publik',
  'Keuangan dan Pengelolaan Anggaran',
  'Pelayanan Publik',
]

export const requiredDocumentTypes = [
  'Surat Pengantar Kampus',
  'Curriculum Vitae',
  'Kartu Tanda Mahasiswa',
  'Pas Foto',
  'Transkrip Nilai',
]

export const users = [
  { id: 1, name: 'Admin DPRD', email: 'admin@dprd.go.id', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Mentor DPRD', email: 'mentor@dprd.go.id', password: 'mentor123', role: 'mentor' },
  { id: 3, name: 'Mahasiswa Demo', email: 'student@dprd.go.id', password: 'student123', role: 'student' },
  { id: 4, name: 'Mahasiswa Baru', email: 'mahasiswa.baru@example.com', password: 'student123', role: 'student' },
]

export const internshipApplications = [
  {
    id: 1,
    userId: 3,
    namaLengkap: 'Mahasiswa Demo',
    nim: 'H1D021001',
    kampus: 'Universitas Jenderal Soedirman',
    programStudi: 'Sistem Informasi',
    semester: 6,
    email: 'student@dprd.go.id',
    noHp: '0812-3456-7890',
    alamat: 'Purwokerto, Kabupaten Banyumas',
    bidangMagang: 'Sistem Informasi dan Teknologi',
    periodeMulai: '2026-07-01',
    periodeSelesai: '2026-09-30',
    motivasi: 'Ingin berkontribusi pada digitalisasi administrasi DPRD Kabupaten Banyumas.',
    status: 'submitted',
    catatanAdmin: '',
    mentorId: null,
    createdAt: '2026-05-01T08:00:00.000Z',
    updatedAt: '2026-05-01T08:00:00.000Z',
    submittedAt: '2026-05-01T08:00:00.000Z',
  },
]

export const applicationDocuments = [
  {
    id: 1,
    applicationId: 1,
    studentId: 3,
    jenisDokumen: 'Surat Pengantar Kampus',
    fileName: 'surat-pengantar.pdf',
    filePath: '/uploads/application-1/surat-pengantar.pdf',
    fileUrl: '/uploads/application-1/surat-pengantar.pdf',
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: '2026-05-01T08:05:00.000Z',
  },
  {
    id: 2,
    applicationId: 1,
    studentId: 3,
    jenisDokumen: 'Curriculum Vitae',
    fileName: 'cv-mahasiswa-demo.pdf',
    filePath: '/uploads/application-1/cv-mahasiswa-demo.pdf',
    fileUrl: '/uploads/application-1/cv-mahasiswa-demo.pdf',
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: '2026-05-01T08:06:00.000Z',
  },
  {
    id: 3,
    applicationId: 1,
    studentId: 3,
    jenisDokumen: 'Kartu Tanda Mahasiswa',
    fileName: 'ktm.pdf',
    filePath: '/uploads/application-1/ktm.pdf',
    fileUrl: '/uploads/application-1/ktm.pdf',
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: '2026-05-01T08:07:00.000Z',
  },
  {
    id: 4,
    applicationId: 1,
    studentId: 3,
    jenisDokumen: 'Pas Foto',
    fileName: 'pas-foto.jpg',
    filePath: '/uploads/application-1/pas-foto.jpg',
    fileUrl: '/uploads/application-1/pas-foto.jpg',
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: '2026-05-01T08:08:00.000Z',
  },
  {
    id: 5,
    applicationId: 1,
    studentId: 3,
    jenisDokumen: 'Transkrip Nilai',
    fileName: 'transkrip.pdf',
    filePath: '/uploads/application-1/transkrip.pdf',
    fileUrl: '/uploads/application-1/transkrip.pdf',
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: '2026-05-01T08:09:00.000Z',
  },
]

export const logbooks = []
export const assessments = []
export const notifications = []
