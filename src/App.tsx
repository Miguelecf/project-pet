import { Layout } from './app/Layout'

function App() {
  return (
    <Layout>
      <div className="dashboard-placeholder">
        <section className="intro" aria-labelledby="dashboard-title">
          <p className="eyebrow">Dashboard foundation</p>
          <h1 id="dashboard-title">A clear view of daily operations, starting here.</h1>
          <p className="intro-copy">
            Project Pet is being prepared to replace scattered financial spreadsheets with a
            focused view of supplier expenses, daily income, and cash flow.
          </p>
        </section>

        <section className="foundation-card" aria-labelledby="foundation-title">
          <div className="foundation-card__heading">
            <p className="section-label">Current foundation</p>
            <h2 id="foundation-title">Your operations dashboard is taking shape.</h2>
          </div>
          <p>
            This local demo is an honest starting point. Financial records, calculations, and
            navigation are not available yet; they will appear as each MVP module is completed
            and verified.
          </p>
        </section>

        <section className="next-steps" aria-labelledby="next-steps-title">
          <div>
            <p className="section-label">Next in the local MVP</p>
            <h2 id="next-steps-title">Built for the work that matters each day.</h2>
          </div>
          <ul aria-label="Planned capabilities" className="capability-list" role="list">
            <li>
              <span className="capability-icon" aria-hidden="true">01</span>
              <div>
                <h3>Supplier expenses</h3>
                <p>Track purchase invoices and their payment status in one place.</p>
              </div>
              <span className="status">Planned</span>
            </li>
            <li>
              <span className="capability-icon" aria-hidden="true">02</span>
              <div>
                <h3>Daily income</h3>
                <p>Record daily sales separately from supplier payments.</p>
              </div>
              <span className="status">Planned</span>
            </li>
            <li>
              <span className="capability-icon" aria-hidden="true">03</span>
              <div>
                <h3>Cash visibility</h3>
                <p>Review paid expenses, pending debt, and an estimated cash result.</p>
              </div>
              <span className="status">Planned</span>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  )
}

export default App
