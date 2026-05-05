import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-96px)] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/45 z-0" />

      <div className="relative z-10 flex min-h-[calc(100vh-96px)] items-center w-full px-10 xl:px-16">
        <div className="max-w-4xl text-white">
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
              Sistem Informasi Magang DPRD Banyumas
            </h1>
            <p className="mb-6 text-base md:text-lg text-slate-100">
              Platform digital untuk monitoring, evaluasi, dan pengelolaan kegiatan magang secara terintegrasi
            </p>

            <div className="flex flex-wrap items-center gap-4">
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
