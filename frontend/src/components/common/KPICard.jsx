import { motion } from 'framer-motion'

export default function KPICard({ title, value, trend }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-2xl p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-accent text-sm mt-1">{trend}</p>
    </motion.div>
  )
}
