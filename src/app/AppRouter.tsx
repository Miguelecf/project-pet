import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import App from '../App'
import { StateOverlay } from '../components/StateOverlay'
import { SupplierForm } from '../modules/suppliers/SupplierForm'
import { SupplierPage } from '../modules/suppliers/SupplierPage'
import { useSuppliers } from '../modules/suppliers/useSuppliers'
import { Layout } from './Layout'
import { RepositoryProvider } from './RepositoryProvider'

const placeholderPages = {
  suppliers: { title: 'Suppliers', description: 'Supplier management will be available in the next catalog milestone.' },
  categories: { title: 'Categories', description: 'Category management will be available in the next catalog milestone.' },
  invoices: { title: 'Invoices', description: 'Invoice management will be available after the financial rules milestone.' },
  dailyIncome: { title: 'Daily income', description: 'Daily income management will be available in a later MVP milestone.' },
  settings: { title: 'Settings', description: 'Settings management will be available in the next catalog milestone.' },
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder-page" aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>
      <p className="eyebrow">Local demo</p>
      <h1 id={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function pageRoute(page: { title: string; description: string }) {
  return <Layout><PlaceholderPage {...page} /></Layout>
}

export function AppRouter() {
  return (
    <RepositoryProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<App />} path="/" />
        <Route element={<Layout><SupplierPage /></Layout>} path="/suppliers" />
        <Route element={<Layout><SupplierForm /></Layout>} path="/suppliers/new" />
        <Route element={<Layout><SupplierEditRoute /></Layout>} path="/suppliers/:id/edit" />
        <Route element={pageRoute(placeholderPages.categories)} path="/categories/*" />
        <Route element={pageRoute(placeholderPages.invoices)} path="/invoices/*" />
        <Route element={pageRoute(placeholderPages.dailyIncome)} path="/daily-income/*" />
        <Route element={pageRoute(placeholderPages.settings)} path="/settings" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
      </BrowserRouter>
    </RepositoryProvider>
  )
}

function SupplierEditRoute() {
  const { suppliers, loading } = useSuppliers()
  const { id } = useParams()
  if (loading) return <StateOverlay state="loading"><section aria-label="Supplier form" /></StateOverlay>
  const supplier = suppliers.find((candidate) => candidate.id === id)
  return supplier ? <SupplierForm supplier={supplier} /> : <Navigate replace to="/suppliers" />
}
