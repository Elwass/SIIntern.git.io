import { useState } from 'react'

const faqItems = [
  {
    question: 'Siapa saja yang dapat mendaftar program magang ini?',
    answer:
      'Program ini terbuka bagi mahasiswa aktif yang memenuhi persyaratan administrasi dari kampus dan ketentuan instansi DPRD Banyumas.',
  },
  {
    question: 'Bagaimana alur pendaftaran magang dilakukan?',
    answer:
      'Pendaftaran dilakukan secara online melalui sistem, dimulai dari registrasi akun, melengkapi data diri, mengunggah berkas, hingga menunggu proses verifikasi.',
  },
  {
    question: 'Dokumen apa saja yang perlu disiapkan?',
    answer:
      'Dokumen umum yang biasanya dibutuhkan meliputi surat pengantar kampus, CV, transkrip nilai, dan dokumen pendukung lain sesuai ketentuan periode magang.',
  },
  {
    question: 'Bagaimana cara memantau status seleksi?',
    answer:
      'Status pendaftaran dapat dipantau langsung melalui dashboard akun pada Sistem Informasi Magang setelah proses pengajuan selesai.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleItem = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index))
  }

  return (
    <section id="faq" className="max-w-6xl mx-auto px-4">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">FAQ Magang Berdampak</h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-md">
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <article key={item.question} className="rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-4 text-left text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold md:text-base">{item.question}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm leading-7 text-gray-600">{item.answer}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
