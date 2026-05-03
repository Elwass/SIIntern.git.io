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
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 mt-10 relative">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Alur Magang</h2>
        <p className="text-gray-600 mt-2 text-center max-w-2xl mx-auto">Proses pelaksanaan magang di DPRD Banyumas secara sistematis dan terstruktur</p>

        <div className="hidden md:block absolute left-1/2 top-20 bottom-0 w-[2px] bg-gray-300 -translate-x-1/2" />
        <div className="md:hidden absolute left-4 top-20 bottom-0 w-[2px] bg-gray-300" />

        <div className="mt-10">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={step.title} className="relative flex items-center justify-between mb-10">
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-sm z-10" />

                <div className="w-full pl-10 md:pl-0 md:w-[45%] md:pr-6 md:text-left">
                  {isLeft && (
                    <>
                      <span className="inline-block bg-red-600 text-white text-[11px] px-2.5 py-0.5 rounded-sm mb-1">Step {i + 1}</span>
                      <div className="w-full bg-white border border-gray-200 p-3 rounded-sm shadow-sm text-sm">
                        <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                        <ul className="text-sm text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
                          {step.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden md:block w-[45%]">
                  {!isLeft && (
                    <div className="w-full pl-6">
                      <span className="inline-block bg-red-600 text-white text-[11px] px-2.5 py-0.5 rounded-sm mb-1">Step {i + 1}</span>
                      <div className="w-full bg-white border border-gray-200 p-3 rounded-sm shadow-sm text-sm">
                        <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                        <ul className="text-sm text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
                          {step.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {!isLeft && (
                  <div className="md:hidden w-full pl-10">
                    <span className="inline-block bg-red-600 text-white text-[11px] px-2.5 py-0.5 rounded-sm mb-1">Step {i + 1}</span>
                    <div className="w-full bg-white border border-gray-200 p-3 rounded-sm shadow-sm text-sm">
                      <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                      <ul className="text-sm text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
                        {step.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
