import { Layout } from './app/Layout'
import { DashboardPage } from './modules/dashboard/DashboardPage'

const systemClock = {
  today: () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}` as never
  },
}

function App() {
  return (
    <Layout>
      <DashboardPage clock={systemClock} />
    </Layout>
  )
}

export default App
