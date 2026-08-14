import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const MOBILE_BREAKPOINT = 768

const navigationItems = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/categories', label: 'Categorías' },
  { to: '/invoices', label: 'Facturas' },
  { to: '/daily-income', label: 'Ingresos diarios' },
  { to: '/settings', label: 'Configuración' },
]

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const updateViewport = () => {
      const nextIsMobile = isMobileViewport()
      setIsMobile(nextIsMobile)
      if (!nextIsMobile) setIsOpen(false)
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  if (isMobile && !isOpen) {
    return (
      <button
        aria-controls="main-navigation"
        aria-expanded="false"
        className="navigation-toggle"
        onClick={() => setIsOpen(true)}
        type="button"
      >
          Abrir navegación
      </button>
    )
  }

  return (
    <aside className={isMobile ? 'sidebar sidebar--mobile' : 'sidebar'}>
      {isMobile && (
        <button
          aria-controls="main-navigation"
          aria-expanded="true"
          className="navigation-toggle"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          Cerrar navegación
        </button>
      )}
      <nav aria-label="Navegación principal" id="main-navigation">
        <ul>
          {navigationItems.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink end={end} to={to}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
