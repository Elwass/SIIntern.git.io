export default function KontakBantuanSection() {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Kontak &amp; Bantuan</h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-md">
        <p className="text-sm leading-7 text-gray-600">
          Pertanyaan seputar Magang Berdampak? Silakan hubungi unit layanan akademik.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-gray-500" aria-hidden="true">
              ✉️
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Email</p>
              <a
                href="mailto:sekwan.inter@gmail.com"
                className="text-sm text-gray-600 transition-colors hover:text-red-600 hover:underline"
              >
                sekwan.inter@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-gray-500" aria-hidden="true">
              📱
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
              <a
                href="https://wa.me/6285175394358"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-md text-sm text-gray-600 transition-colors hover:text-red-600 hover:underline"
              >
                +62 85175394358
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
