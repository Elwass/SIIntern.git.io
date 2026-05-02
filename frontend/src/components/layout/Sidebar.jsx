import { NavLink } from 'react-router-dom'

const links = [
  ['/', 'Landing'],
  ['/login', 'Login'],
  ['/admin', 'Admin'],
  ['/mentor', 'Mentor'],
  ['/student', 'Student'],
  ['/report', 'Reports'],
]

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 glass rounded-2xl p-4 min-h-[88vh]">
      <h2 className="font-bold text-lg mb-4">SIIntern</h2>
      <nav className="space-y-2">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `block p-2 rounded-xl ${isActive ? 'bg-primary text-white' : 'hover:bg-white/70'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
