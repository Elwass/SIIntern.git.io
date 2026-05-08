import { Link } from 'react-router-dom'
import InternshipRegistrationCTA from './InternshipRegistrationCTA'

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-96px)] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 z-0 bg-slate-950/55" />

      <div className="relative z-10 flex min-h-[calc(100vh-96px)] w-full items-center px-10 xl:px-16">
        <div className="max-w-4xl text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-red-100">DPRD Kabupaten Banyumas</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
            Sistem Informasi Magang Berdampak
          </h1>
          <p className="mb-6 text-base leading-7 text-slate-100 md:text-lg">
            Platform resmi untuk pendaftaran, verifikasi berkas, logbook, monitoring mentor, penilaian, dan laporan akhir program magang DPRD Kabupaten Banyumas.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold transition-colors"
            >
              Masuk Sistem
            </Link>
            <InternshipRegistrationCTA className="px-6 py-3 border border-white text-white font-semibold hover:bg-white/10 transition-colors" />
          </div>
        </div>
      </div>
    </section>
  )
}
