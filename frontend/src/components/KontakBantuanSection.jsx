export default function KontakBantuanSection() {
  return (
    <section id="kontak-bantuan" className="max-w-6xl mx-auto px-4">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Kontak &amp; Bantuan</h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-md">
        <p className="text-sm leading-7 text-gray-600">
          Pertanyaan seputar Magang Berdampak? Silakan hubungi unit layanan akademik.
        </p>

        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-gray-700">
          <li>
            <span className="font-semibold">Email:</span>{' '}
            <a href="mailto:sekwan.inter@gmail.com" className="text-gray-600 hover:underline">
              sekwan.inter@gmail.com
            </a>
          </li>
          <li>
            <span className="font-semibold">WhatsApp:</span>{' '}
            <a
              href="https://wa.me/6285175394358"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:underline"
            >
              +62 85175394358
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
