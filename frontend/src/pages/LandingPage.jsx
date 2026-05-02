import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <Navbar />
      <div className="p-6 md:p-14 space-y-12">
      <section className="glass rounded-2xl p-10 text-center space-y-4">
        <h1 className="text-4xl font-extrabold">Internship Management Dashboard</h1>
        <p className="text-slate-600">Digital internship operations for Secretariat DPRD Banyumas.</p>
        <Link to="/login"><Button>Login to System</Button></Link>
      </section>
      <section className="grid md:grid-cols-4 gap-4">{['Dashboard','Attendance','Logbook','AI Summary'].map(x => <motion.div key={x} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">{x}</motion.div>)}</section>
      <section className="glass rounded-2xl p-6"><h3 className="font-semibold mb-2">Workflow</h3><ol className="list-decimal pl-5 text-sm space-y-1"><li>Student check-in attendance (QR/GPS)</li><li>Submit daily logbook</li><li>Mentor validates and evaluates</li><li>Admin monitors and generates reports</li></ol></section>
      <footer className="text-center text-sm text-slate-500">© 2026 Secretariat DPRD Banyumas</footer>
      </div>
    </div>
  )
}
