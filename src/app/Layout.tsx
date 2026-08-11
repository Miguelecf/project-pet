import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
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
        <main className="workspace" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <footer className="app-footer">
        <p>Local-only MVP. No account, cloud sync, or client data is connected.</p>
      </footer>
    </div>
  )
}
