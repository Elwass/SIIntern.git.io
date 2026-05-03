const profilCards = [
  {
    title: 'Skema Magang',
    items: [
      'Kegiatan berbasis logbook harian',
      'Pendampingan oleh mentor instansi',
      'Evaluasi berkala selama program',
      'Terintegrasi dengan aktivitas kerja instansi',
    ],
  },
  {
    title: 'Durasi & Pelaksanaan',
    items: [
      'Durasi menyesuaikan kebijakan kampus dan instansi asal mahasiswa',
      'Waktu/jam kegiatan mengikuti operasional instansi',
      'Jadwal fleksibel sesuai kebutuhan dan kesepakatan',
      'Berbasis aktivitas kerja nyata di lingkungan instansi',
    ],
  },
  {
    title: 'Bidang Kegiatan',
    items: [
      'Administrasi pemerintahan',
      'Sistem informasi & teknologi',
      'Pengelolaan data & dokumentasi',
      'Hukum dan kebijakan publik',
      'Keuangan dan pengelolaan anggaran',
      'Pelayanan publik',
    ],
  },
  {
    title: 'Output Program',
    items: [
      'Laporan kegiatan magang',
      'Penilaian kinerja dari mentor',
      'Rekap logbook harian',
      'Pengalaman kerja profesional',
    ],
  },
]

export default function ProfilMagang() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">Profil Program Magang</h2>
          <p className="text-gray-600 mt-2">
            Program magang DPRD Banyumas dirancang untuk memberikan pengalaman kerja nyata secara terstruktur dan profesional bagi mahasiswa dari berbagai bidang keilmuan
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {profilCards.map((card) => (
            <article key={card.title} className="bg-white shadow-sm rounded-md p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <ul className="mt-4 space-y-2">
                {card.items.map((item) => (
                  <li key={item} className="text-gray-600 text-sm leading-relaxed">• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
