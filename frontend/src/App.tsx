import { useEffect, useState } from 'react'

type Status = 'loading' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((body: { status: string }) => setStatus(body.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">core-hub</h1>
      <p>
        API: {status === 'loading' && 'checking…'}
        {status === 'ok' && 'online'}
        {status === 'error' && 'unavailable'}
      </p>
    </main>
  )
}

export default App
