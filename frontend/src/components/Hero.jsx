import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-700">
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-10 flex items-center">
        <div className="max-w-3xl text-white space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
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
    </section>
  )
}
