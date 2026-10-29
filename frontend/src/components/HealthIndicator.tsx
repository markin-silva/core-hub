import { useEffect, useState } from 'react'

type Status = 'checking' | 'online' | 'unavailable'

// Discreet API status line. Calls the health endpoint through the same-origin proxy.
export function HealthIndicator() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((body: { status: string }) =>
        setStatus(body.status === 'ok' ? 'online' : 'unavailable'),
      )
      .catch(() => setStatus('unavailable'))
  }, [])

  return (
    <p className="text-xs text-gray-500">
      API: {status === 'checking' && 'checking…'}
      {status === 'online' && 'online'}
      {status === 'unavailable' && 'unavailable'}
    </p>
  )
}
