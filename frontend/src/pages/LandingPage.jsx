import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProfilMagang from '../components/ProfilMagang'
import AlurMagang from '../components/AlurMagang'
import SyaratKetentuan from '../components/SyaratKetentuan'

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <ProfilMagang />
      <AlurMagang />
      <SyaratKetentuan />
      <div className="p-6 md:p-14 space-y-12">
      <section className="grid md:grid-cols-4 gap-4">{['Dashboard','Attendance','Logbook','AI Summary'].map(x => <motion.div key={x} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">{x}</motion.div>)}</section>
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Pendaftaran</h2>
        <div className="mt-4 bg-white shadow-sm rounded-2xl p-5 md:p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Mahasiswa yang ingin mengikuti program magang DPRD Banyumas diwajibkan melakukan <strong>registrasi akun</strong> terlebih dahulu melalui sistem. Setelah akun berhasil dibuat, peserta dapat <strong>login ke sistem</strong> untuk melengkapi data diri dan mengajukan pendaftaran magang sesuai bidang yang tersedia.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Seluruh proses pendaftaran dilakukan secara online melalui platform Sistem Informasi Magang, mulai dari pengisian data, upload berkas, hingga pemantauan status seleksi.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed mt-4">
            Pastikan seluruh data dan dokumen yang diunggah sesuai dengan ketentuan yang berlaku.
          </p>
          <div className="mt-5 flex flex-wrap justify-start md:justify-end gap-2.5">
            <a href="/register" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition">
            Daftar Magang
            </a>
            <a href="/login" className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-semibold transition">
            Login Sistem
            </a>
            <a href="/panduan" className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold transition">
            Panduan
            </a>
          </div>
        </div>
      </section>
      <footer className="text-center text-sm text-slate-500">© 2026 Secretariat DPRD Banyumas</footer>
      </div>
    </div>
  )
}
