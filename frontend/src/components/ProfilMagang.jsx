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
      'Berbasis aktivitas kerja nyata di lingkungan instansi',
    ],
  },
  {
    title: 'Bidang Kegiatan',
    items: [
      'Administrasi pemerintahan',
      'Sistem informasi dan teknologi',
      'Pengelolaan data dan dokumentasi',
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
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Profil Program Magang</h2>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Program magang DPRD Banyumas memberikan kesempatan bagi mahasiswa untuk terlibat langsung dalam lingkungan kerja pemerintahan, serta mengembangkan kemampuan teknis (hard skills) dan keterampilan profesional (soft skills) secara terstruktur.
          </p>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Kegiatan magang dilaksanakan melalui pendampingan mentor, pencatatan logbook harian, serta evaluasi berkala guna memastikan proses pembelajaran berjalan optimal dan sesuai dengan kebutuhan instansi serta kompetensi yang diharapkan dari peserta.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profilCards.map((card) => (
            <article key={card.title} className="bg-white shadow-sm rounded-md border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <ol className="mt-4 list-decimal pl-5 text-gray-600 space-y-1">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
