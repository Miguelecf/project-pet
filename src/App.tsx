import { MODULES } from './modules'

function App() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>project-pet</h1>
      <p>Feature-based structure ready. Modules:</p>
      <ul>
        {MODULES.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <p>
        Supabase access will live only in <code>src/lib/supabase/</code>.
      </p>
    </main>
  )
}

export default App
