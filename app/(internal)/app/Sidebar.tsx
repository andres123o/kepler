'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '../login/actions'

const NAV = [
  { href: '/app/ingresar',       label: 'Ingresar datos', icon: '✏️' },
  { href: '/app/predecir',       label: 'Predecir',        icon: '🎯' },
  { href: '/app/estrategia',     label: 'Estrategia',      icon: '⚡' },
  { href: '/app/modelo',         label: 'Modelo',          icon: '🧠' },
  { href: '/app/monitoreo',      label: 'Monitoreo',        icon: '📊' },
  { href: '/app/medicion',       label: 'Métricas y Resultados', icon: '📐' },
  { href: '/app/configuracion',  label: 'Configuración',   icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">K</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">Kepler</p>
            <p className="text-neutral-500 text-xs mt-0.5">Trii · Interno</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-500/10 text-amber-400 font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-600 px-3 mb-2">admin</p>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <span className="text-base leading-none">↩</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
