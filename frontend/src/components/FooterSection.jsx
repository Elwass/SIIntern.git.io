export default function FooterSection() {
  return (
    <footer className="mt-12 w-full border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/dprd-logo.webp" alt="Logo DPRD Kab. Banyumas" className="h-12 w-auto object-contain" />
            <h3 className="text-lg font-semibold text-gray-900">DPRD Kabupaten Banyumas</h3>
          </div>
          <p className="mt-4 max-w-[320px] text-sm leading-7 text-gray-600">
            Platform informasi dan pendaftaran Magang Berdampak DPRD Kabupaten Banyumas.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="mailto:sekwan.inter@gmail.com" className="hover:text-gray-800 hover:underline">
                  sekwan.inter@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6285175394358"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-800 hover:underline"
                >
                  +62 85175394358
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Alamat</h4>
            <p className="text-sm leading-7 text-gray-600">
              Jl. Kabupaten No.1, Purwokerto, Sokanegara, Kec. Purwokerto Tim., Kabupaten Banyumas, Jawa Tengah 53115
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#profil-magang" className="hover:text-gray-800 hover:underline">Profil Magang</a></li>
              <li><a href="#pendaftaran" className="hover:text-gray-800 hover:underline">Pendaftaran</a></li>
              <li><a href="#faq" className="hover:text-gray-800 hover:underline">FAQ</a></li>
              <li><a href="#kontak-bantuan" className="hover:text-gray-800 hover:underline">Kontak &amp; Bantuan</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <p>© 2025 DPRD Kabupaten Banyumas. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-700 hover:underline">Kebijakan Privasi</a>
              <a href="#" className="hover:text-gray-700 hover:underline">Syarat &amp; Ketentuan</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
