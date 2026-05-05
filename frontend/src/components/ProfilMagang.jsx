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
    <section id="profil-magang" className="bg-white pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Profil Program Magang</h2>
        <p className="mt-3 w-full text-gray-600 leading-relaxed">
          Program magang DPRD Banyumas memberikan kesempatan bagi mahasiswa untuk terlibat langsung dalam lingkungan kerja pemerintahan serta mengembangkan kemampuan teknis (hard skills) dan keterampilan profesional (soft skills) secara terstruktur melalui pendampingan mentor, pencatatan logbook harian, serta evaluasi berkala agar proses pembelajaran berjalan optimal dan sesuai kebutuhan instansi.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profilCards.map((card) => (
            <article key={card.title} className="bg-white border border-gray-200 rounded-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{card.title}</h3>
              <ol className="list-decimal pl-4 text-sm text-gray-600 space-y-1">
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
