const steps = [
  {
    title: 'Pendaftaran',
    items: ['Mengisi form pendaftaran online', 'Upload berkas (CV, surat pengantar, dll)'],
  },
  {
    title: 'Verifikasi',
    items: ['Seleksi administrasi oleh instansi', 'Penyesuaian bidang magang'],
  },
  {
    title: 'Pelaksanaan',
    items: ['Kegiatan magang di instansi', 'Pengisian logbook harian', 'Pendampingan mentor'],
  },
  {
    title: 'Evaluasi',
    items: ['Penilaian kinerja peserta', 'Review kegiatan oleh mentor'],
  },
  {
    title: 'Selesai',
    items: ['Penyusunan laporan akhir', 'Sertifikat atau hasil magang'],
  },
]

export default function AlurMagang() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-gray-900">Alur Magang</h2>
        <p className="text-gray-600 mt-2">Proses pelaksanaan magang di DPRD Banyumas secara sistematis dan terstruktur</p>

        <div className="relative mt-8 space-y-8">
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-[2px] bg-gray-200 h-full" />

          {steps.map((step, i) => (
            <div key={step.title} className="relative flex md:items-center md:justify-between">
              <div className={`w-full md:w-[45%] ${i % 2 === 0 ? 'md:order-1' : 'md:order-3'}`}>
                <article className="bg-white border border-gray-200 rounded-sm p-4">
                  <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 mb-2">Step {i + 1}</span>
                  <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {step.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="hidden md:flex md:order-2 md:w-[10%] justify-center">
                <span className="w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
