import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProfilMagang from '../components/ProfilMagang'
import AlurMagang from '../components/AlurMagang'
import SyaratKetentuan from '../components/SyaratKetentuan'
import FAQSection from '../components/FAQSection'
import KontakBantuanSection from '../components/KontakBantuanSection'
import FooterSection from '../components/FooterSection'

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
      <section id="pendaftaran" className="max-w-6xl mx-auto px-4">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Pendaftaran</h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-md">
          <p className="text-sm leading-7 text-gray-600">
            Mahasiswa yang ingin mengikuti program magang DPRD Banyumas diwajibkan melakukan <strong>registrasi akun</strong> terlebih dahulu melalui sistem. Setelah akun berhasil dibuat, peserta dapat <strong>login ke sistem</strong> untuk melengkapi data diri dan mengajukan pendaftaran magang sesuai bidang yang tersedia.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Seluruh proses pendaftaran dilakukan secara online melalui platform Sistem Informasi Magang, mulai dari pengisian data, upload berkas, hingga pemantauan status seleksi.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Pastikan seluruh data dan dokumen yang diunggah sesuai dengan ketentuan yang berlaku.
          </p>
          <div className="mt-6 flex justify-start md:justify-end">
            <a href="/register" className="w-full md:w-auto rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700">
              Daftar Magang
            </a>
          </div>
        </div>
      </section>
      <FAQSection />
      <KontakBantuanSection />
      <FooterSection />
      </div>
    </div>
  )
}
