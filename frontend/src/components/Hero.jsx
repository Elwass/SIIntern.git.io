import { Link } from 'react-router-dom'

export default function Hero() {
  const heroBackgroundClass =
    "bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-700 bg-cover bg-center bg-no-repeat"
  // Future image-ready replacement:
  // "bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat"

  return (
    <section className={`relative h-screen mt-0 pt-0 w-full ${heroBackgroundClass}`}>
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Sistem Informasi Magang DPRD Banyumas
            </h1>
            <p className="text-base md:text-lg text-slate-100">
              Platform digital untuk monitoring, evaluasi, dan pengelolaan kegiatan magang secara terintegrasi
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold transition-colors"
              >
                Masuk Sistem
              </Link>
              <button className="px-6 py-3 border border-white text-white font-semibold hover:bg-white/10 transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
