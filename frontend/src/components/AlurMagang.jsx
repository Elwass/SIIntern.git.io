import { useEffect, useRef, useState } from 'react'

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
  const lineRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!lineRef.current) return
      const rect = lineRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const visible = windowHeight - rect.top
      const total = rect.height
      let percent = visible / total
      percent = Math.max(0, Math.min(1, percent))
      setProgress(percent)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="pt-6 pb-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 relative">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Alur Magang</h2>
        <p className="text-gray-600 mt-2 text-center max-w-2xl mx-auto">Proses pelaksanaan magang di DPRD Banyumas secara sistematis dan terstruktur</p>

        <div ref={lineRef} className="hidden md:block absolute left-1/2 top-20 -translate-x-1/2 w-[2px] bg-gray-200 h-full overflow-hidden">
          <div className="bg-red-500 w-full transition-all duration-300" style={{ height: `${progress * 100}%` }} />
        </div>
        <div className="md:hidden absolute left-4 top-20 bottom-0 w-[2px] bg-gray-200 opacity-70" />

        <div className="mt-10">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={step.title} className="relative flex items-center justify-between mb-16">
                <div
                  className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-red-500 rounded-full z-10 shadow-[0_0_0_6px_rgba(239,68,68,0.15)] transition-all duration-300"
                  style={{ transform: progress > 0.2 ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.6)', opacity: progress > 0.2 ? 1 : 0.3 }}
                />

                <div className="w-full pl-10 md:pl-0 md:w-[42%] md:pr-6 md:text-left">
                  {isLeft && (
                    <>
                      <span className="inline-block bg-red-500 text-white text-xs px-4 py-1 rounded-full shadow-md mb-1">Step {i + 1}</span>
                      <div className="relative">
                        <div className="absolute -inset-2 bg-red-50 rounded-xl blur-xl opacity-40"></div>
                        <div className="relative bg-white p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all duration-300 text-sm">
                          <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                            {step.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden md:block w-[42%]">
                  {!isLeft && (
                    <div className="w-full pl-6 text-left">
                      <span className="inline-block bg-red-500 text-white text-xs px-4 py-1 rounded-full shadow-md mb-1">Step {i + 1}</span>
                      <div className="relative">
                        <div className="absolute -inset-2 bg-red-50 rounded-xl blur-xl opacity-40"></div>
                        <div className="relative bg-white p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all duration-300 text-sm">
                          <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                            {step.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!isLeft && (
                  <div className="md:hidden w-full pl-10">
                    <span className="inline-block bg-red-500 text-white text-xs px-4 py-1 rounded-full shadow-md mb-1">Step {i + 1}</span>
                    <div className="relative">
                      <div className="absolute -inset-2 bg-red-50 rounded-xl blur-xl opacity-40"></div>
                      <div className="relative bg-white p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all duration-300 text-sm">
                        <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                          {step.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
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
