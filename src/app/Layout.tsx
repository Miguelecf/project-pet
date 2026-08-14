import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const mainContentRef = useRef<HTMLElement>(null)
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return
    }

    previousPathname.current = location.pathname
    const heading = mainContentRef.current?.querySelector<HTMLHeadingElement>('h1')

    if (heading) {
      heading.tabIndex = -1
      heading.focus()
    }
  }, [location.pathname])

  function focusMainContent() {
    window.location.hash = 'main-content'
    mainContentRef.current?.focus()
  }

  function handleSkipLinkKeyDown(event: KeyboardEvent<HTMLAnchorElement>) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return
    }

    if (event.key !== 'Enter') {
      event.preventDefault()
    }

    focusMainContent()
  }

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={focusMainContent}
        onKeyDown={handleSkipLinkKeyDown}
      >
        Ir al contenido principal
      </a>
      <header className="app-header">
        <div className="brand-lockup">
          <span aria-hidden="true" className="brand-mark">
            PP
          </span>
          <div>
            <p className="eyebrow">Operación financiera de pet shop</p>
            <p className="brand-name">Project Pet</p>
          </div>
        </div>
        <p className="demo-badge" role="status">
          <span aria-hidden="true" />
          MVP local · Modo demo
        </p>
      </header>
      <div className="app-body">
        <Sidebar />
        <main className="workspace" id="main-content" ref={mainContentRef} tabIndex={-1}>
          {children}
        </main>
      </div>
      <footer className="app-footer">
        <p>MVP solo local. No hay cuenta, sincronización en la nube ni datos de clientes conectados.</p>
      </footer>
    </div>
  )
}
