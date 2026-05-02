import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <Navbar />
      <Hero />
      <div className="p-6 md:p-14 space-y-12">
      <section className="grid md:grid-cols-4 gap-4">{['Dashboard','Attendance','Logbook','AI Summary'].map(x => <motion.div key={x} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">{x}</motion.div>)}</section>
      <section className="glass rounded-2xl p-6"><h3 className="font-semibold mb-2">Workflow</h3><ol className="list-decimal pl-5 text-sm space-y-1"><li>Student check-in attendance (QR/GPS)</li><li>Submit daily logbook</li><li>Mentor validates and evaluates</li><li>Admin monitors and generates reports</li></ol></section>
      <footer className="text-center text-sm text-slate-500">© 2026 Secretariat DPRD Banyumas</footer>
      </div>
    </div>
  )
}
