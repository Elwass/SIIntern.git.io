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

const navUnderlineBase =
  "relative h-full px-3 text-sm font-bold flex items-center transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-200"

function DropdownItem({ item }) {
  return (
    <div className="relative group h-full flex items-center">
      <button
        type="button"
        className={`${navUnderlineBase} gap-1 text-gray-800 hover:text-red-700 group-hover:after:w-full`}
      >
        {item.label}
        <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div className="absolute left-0 top-full z-50 min-w-52 -translate-y-1 bg-white p-2 opacity-0 shadow-md transition-all duration-150 pointer-events-none group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="space-y-1">
          {item.children.map((child) => (
            <button
              key={child}
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-gray-800 transition-colors duration-200 hover:text-red-600"
            >
              {child}
            </button>
          ))}
        </div>
      </div>
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
    <header
      className={`fixed top-0 left-0 z-50 w-full border-b border-red-600 bg-white transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${isScrolledState ? 'shadow-sm' : ''}`}
    >
      <div className="flex min-h-[84px] w-full items-center justify-between px-10 py-3 xl:px-16 md:min-h-[92px] md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src="/images/dprd-logo.webp"
            alt="Logo DPRD Kab. Banyumas"
            className="h-12 w-auto object-contain md:h-14"
          />
          <div>
            <h1 className="font-extrabold leading-tight text-slate-900">DPRD Kabupaten Banyumas</h1>
            <p className="text-xs text-slate-500">Sistem Informasi Magang Berdampak</p>
          </div>
        </div>

        <nav className="hidden self-stretch items-stretch gap-1 lg:flex">
          {menuItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `group ${navUnderlineBase} ${
                    isActive
                      ? 'font-semibold text-red-600 after:w-full'
                      : 'text-gray-800 hover:text-red-700 group-hover:after:w-full'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <DropdownItem key={item.label} item={item} />
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 text-slate-700 lg:flex">
          <button className="p-2 transition-colors hover:text-red-700">
            <Globe size={18} />
          </button>
          <button className="p-2 transition-colors hover:text-red-700">
            <Search size={18} />
          </button>
        </div>

        <button className="p-2 lg:hidden" onClick={() => setOpenMobile((v) => !v)}>
          {openMobile ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {openMobile && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 lg:hidden">
          {menuItems.map((item) => (
            <div key={item.label} className="py-2">
              <p className="text-sm font-bold text-gray-800">{item.label}</p>
              {item.children && (
                <div className="space-y-1 pl-3 pt-1 text-sm text-gray-600">
                  {item.children.map((child) => (
                    <p key={child}>{child}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
