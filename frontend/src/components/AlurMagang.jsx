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
    items: ['Penyusunan laporan akhir', 'Sertifikat magang'],
  },
]

export default function AlurMagang() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 relative">
        <h2 className="text-2xl font-semibold text-gray-900">Alur Magang</h2>
        <p className="text-gray-600 mt-2 mb-10">Proses pelaksanaan magang di DPRD Banyumas secara sistematis dan terstruktur</p>

        <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-[2px] bg-gray-300 h-full" />

        <div className="space-y-6 md:space-y-0">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={step.title} className="relative flex justify-between items-start mb-12">
                <div className="hidden md:block w-[45%]">
                  {isLeft && (
                    <article className="w-full bg-white border border-gray-200 rounded-sm p-4 text-sm">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 inline-block mb-2">Step {i + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {step.items.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </article>
                  )}
                </div>

                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full border-4 border-white shadow-sm" />

                <div className="hidden md:block w-[45%]">
                  {!isLeft && (
                    <article className="w-full bg-white border border-gray-200 rounded-sm p-4 text-sm">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 inline-block mb-2">Step {i + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {step.items.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </article>
                  )}
                </div>

                <div className="md:hidden w-full">
                  <article className="w-full bg-white border border-gray-200 rounded-sm p-4 text-sm">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 inline-block mb-2">Step {i + 1}</span>
                    <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {step.items.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </article>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
