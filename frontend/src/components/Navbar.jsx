import { useEffect, useState } from 'react'
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

const navUnderlineBase = 'relative h-full px-3 text-sm font-bold flex items-center transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-200'

function DropdownItem({ item }) {
  return (
    <div className="relative group h-full flex items-center">
      <button className={`${navUnderlineBase} text-gray-800 hover:text-red-700 gap-1 group-hover:after:w-full`}>
        {item.label}
        {item.children && <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />}
      </button>
      {item.children && (
        <div className="absolute left-0 top-full opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150">
          <div className="min-w-52 bg-white rounded-none shadow-md p-2 space-y-1">
            {item.children.map((child) => (
              <button key={child} className="relative w-full text-left px-3 py-2 text-sm text-gray-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-200 hover:after:w-full">
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
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolledState, setIsScrolledState] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const showThreshold = window.innerHeight * 0.45

      if (scrollY <= 20) {
        setIsVisible(true)
        setIsScrolledState(false)
      } else if (scrollY > showThreshold) {
        setIsVisible(true)
        setIsScrolledState(true)
      } else {
        setIsVisible(false)
        setIsScrolledState(false)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 z-50 w-full bg-white border-b border-red-600 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolledState ? 'shadow-sm' : ''}`}>
      <div className="w-full px-10 xl:px-16 py-4 min-h-[88px] md:min-h-[96px] flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <img src="/images/dprd-logo.webp" alt="Logo DPRD Kab. Banyumas" className="h-12 w-auto object-contain md:h-14" />
          <div>
            <h1 className="font-extrabold text-slate-900 leading-tight">DPRD Kabupaten Banyumas</h1>
            <p className="text-xs text-slate-500">Sistem Informasi Magang Berdampak</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center h-full gap-1">
          {menuItems.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => `group ${navUnderlineBase} ${isActive ? 'text-red-600 font-semibold after:w-full' : 'text-gray-800 hover:text-red-700 group-hover:after:w-full'}`}>
                {() => (
                  <>
                    {item.label}
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
