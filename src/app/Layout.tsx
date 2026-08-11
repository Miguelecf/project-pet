import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const mainContentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const heading = mainContentRef.current?.querySelector<HTMLHeadingElement>('h1')

    if (heading) {
      heading.tabIndex = -1
      heading.focus()
    }
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          window.location.hash = 'main-content'
          mainContentRef.current?.focus()
        }}
      >
        Skip to main content
      </a>
      <header className="app-header">
        <div className="brand-lockup">
          <span aria-hidden="true" className="brand-mark">
            PP
          </span>
          <div>
            <p className="eyebrow">Pet-shop financial operations</p>
            <p className="brand-name">Project Pet</p>
          </div>
        </div>
        <p className="demo-badge" role="status">
          <span aria-hidden="true" />
          Local MVP · Demo mode
        </p>
      </header>
      <div className="app-body">
        <Sidebar />
        <main className="workspace" id="main-content" ref={mainContentRef} tabIndex={-1}>
          {children}
        </main>
      </div>
      <footer className="app-footer">
        <p>Local-only MVP. No account, cloud sync, or client data is connected.</p>
      </footer>
    </div>
  )
}
