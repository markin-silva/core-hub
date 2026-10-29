import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/session'
import { SESSION_QUERY_KEY, useSession } from '../auth/useSession'

export function HomePage() {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout()
    queryClient.setQueryData(SESSION_QUERY_KEY, null)
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto max-w-sm p-4">
      <h1 className="mb-2 text-xl font-semibold">core-hub</h1>
      <p className="mb-4 text-sm">Logged in as {session.data?.email}</p>
      <button onClick={handleLogout} className="rounded border px-3 py-2">
        Log out
      </button>
    </main>
  )
}
