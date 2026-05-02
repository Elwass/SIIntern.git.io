import { useState } from 'react'
import { ChevronDown, Globe, Menu, Search, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', children: ['Profil Magang', 'Alur Magang', 'Syarat & Ketentuan'] },
  { label: 'Kegiatan', children: ['Absensi', 'Logbook', 'Tugas'] },
  { label: 'Dashboard', to: '/admin' },
  { label: 'Penilaian', children: ['Evaluasi', 'Feedback'] },
  { label: 'Dokumen', children: ['Template', 'Upload'] },
  { label: 'AI Assistant', children: ['Ringkasan', 'Laporan Otomatis'], highlight: true },
  { label: 'Informasi', children: ['Pengumuman', 'FAQ', 'Kontak'] },
]

function DropdownItem({ item }) {
  return (
    <div className="relative group h-20 flex items-center">
      <button className="relative h-full px-3 text-sm font-bold text-gray-800 transition-colors duration-200 hover:text-red-700 flex items-center gap-1">
        {item.label}
        {item.children && <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />}
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-700 transition-all duration-200 group-hover:w-full" />
      </button>
      {item.children && (
        <div className="absolute left-0 top-full opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150">
          <div className="min-w-52 bg-white rounded-none shadow-md p-2 space-y-1">
            {item.children.map((child) => (
              <button key={child} className="w-full text-left px-3 py-2 text-sm text-gray-800 transition-colors duration-150 hover:text-red-700">
                {child}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-slate-900 leading-tight">SI-MAGANG DPRD</h1>
          <p className="text-xs text-slate-500">Sistem Informasi Magang</p>
        </div>

        <nav className="hidden lg:flex items-center h-full gap-1">
          {menuItems.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => `group relative h-full px-3 text-sm font-bold flex items-center transition-colors duration-200 ${isActive ? 'text-red-700' : 'text-gray-800 hover:text-red-700'}`}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-red-700 transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </>
                )}
              </NavLink>
            ) : (
              <DropdownItem key={item.label} item={item} />
            ),
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2 text-slate-700">
          <button className="p-2 transition-colors hover:text-red-700"><Globe size={18} /></button>
          <button className="p-2 transition-colors hover:text-red-700"><Search size={18} /></button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpenMobile((v) => !v)}>
          {openMobile ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {openMobile && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pb-4">
          {menuItems.map((item) => (
            <div key={item.label} className="py-2">
              <p className="font-bold text-sm text-gray-800">{item.label}</p>
              {item.children && <div className="pl-3 pt-1 space-y-1 text-sm text-gray-600">{item.children.map((child) => <p key={child}>{child}</p>)}</div>}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
