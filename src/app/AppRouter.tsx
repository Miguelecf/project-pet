import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import App from '../App'
import { StateOverlay } from '../components/StateOverlay'
import { CategoryForm } from '../modules/categories/CategoryForm'
import { CategoryPage } from '../modules/categories/CategoryPage'
import { useCategories } from '../modules/categories/useCategories'
import { InvoiceForm } from '../modules/invoices/InvoiceForm'
import { InvoiceDetailPage } from '../modules/invoices/InvoiceDetailPage'
import { InvoiceListPage } from '../modules/invoices/InvoiceListPage'
import type { InvoiceWithLines } from '../modules/invoices/InvoiceRepository'
import { useInvoices } from '../modules/invoices/useInvoices'
import { SettingsPage } from '../modules/settings/SettingsPage'
import { SupplierForm } from '../modules/suppliers/SupplierForm'
import { SupplierPage } from '../modules/suppliers/SupplierPage'
import { useSuppliers } from '../modules/suppliers/useSuppliers'
import { DailyIncomeForm } from '../modules/daily-income/DailyIncomeForm'
import { DailyIncomePage } from '../modules/daily-income/DailyIncomePage'
import { useDailyIncomes } from '../modules/daily-income/useDailyIncomes'
import { Layout } from './Layout'
import { RepositoryProvider } from './RepositoryProvider'

const placeholderPages = {
  suppliers: { title: 'Proveedores', description: 'La gestión de proveedores estará disponible en la próxima etapa del catálogo.' },
  categories: { title: 'Categorías', description: 'La gestión de categorías estará disponible en la próxima etapa del catálogo.' },
  invoices: { title: 'Facturas', description: 'La gestión de facturas estará disponible después de la etapa de reglas financieras.' },
  settings: { title: 'Configuración', description: 'La gestión de la configuración estará disponible en la próxima etapa del catálogo.' },
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder-page" aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>
      <p className="eyebrow">Demo local</p>
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
        <Route element={<Layout><CategoryPage /></Layout>} path="/categories" />
        <Route element={<Layout><CategoryForm /></Layout>} path="/categories/new" />
        <Route element={<Layout><CategoryEditRoute /></Layout>} path="/categories/:id/edit" />
        <Route element={<Layout><InvoiceForm /></Layout>} path="/invoices/new" />
        <Route element={<Layout><InvoiceEditRoute /></Layout>} path="/invoices/:id/edit" />
        <Route element={<Layout><InvoiceDetailRoute /></Layout>} path="/invoices/:id" />
        <Route element={<Layout><InvoiceListPage /></Layout>} path="/invoices" />
        <Route element={pageRoute(placeholderPages.invoices)} path="/invoices/*" />
        <Route element={<Layout><DailyIncomePage /></Layout>} path="/daily-income" />
        <Route element={<Layout><DailyIncomeForm /></Layout>} path="/daily-income/new" />
        <Route element={<Layout><DailyIncomeEditRoute /></Layout>} path="/daily-income/:id/edit" />
        <Route element={<Layout><SettingsPage /></Layout>} path="/settings" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
      </BrowserRouter>
    </RepositoryProvider>
  )
}

function SupplierEditRoute() {
  const { suppliers, loading } = useSuppliers()
  const { id } = useParams()
  if (loading) return <StateOverlay state="loading"><section aria-label="Formulario de proveedor" /></StateOverlay>
  const supplier = suppliers.find((candidate) => candidate.id === id)
  return supplier ? <SupplierForm supplier={supplier} /> : <Navigate replace to="/suppliers" />
}

function CategoryEditRoute() {
  const { categories, loading } = useCategories()
  const { id } = useParams()
  if (loading) return <StateOverlay state="loading"><section aria-label="Formulario de categoría" /></StateOverlay>
  const category = categories.find((candidate) => candidate.id === id)
  return category ? <CategoryForm category={category} /> : <Navigate replace to="/categories" />
}

function InvoiceEditRoute() {
  const { id } = useParams()
  const { findById } = useInvoices()
  const [invoice, setInvoice] = useState<InvoiceWithLines | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    void findById(id as never).then(setInvoice).catch(() => setInvoice(null))
  }, [findById, id])

  if (invoice === undefined) return <StateOverlay state="loading"><section aria-label="Formulario de factura" /></StateOverlay>
  return invoice ? <InvoiceForm invoice={invoice} /> : <Navigate replace to="/invoices" />
}

function InvoiceDetailRoute() {
  const { id } = useParams()
  return id ? <InvoiceDetailPage invoiceId={id} /> : <Navigate replace to="/invoices" />
}

function DailyIncomeEditRoute() {
  const { id } = useParams()
  const { incomes, loading } = useDailyIncomes()
  if (loading) return <StateOverlay state="loading"><section aria-label="Formulario de ingreso diario" /></StateOverlay>
  const income = incomes.find((candidate) => candidate.id === id)
  return income ? <DailyIncomeForm income={income} /> : <Navigate replace to="/daily-income" />
}
