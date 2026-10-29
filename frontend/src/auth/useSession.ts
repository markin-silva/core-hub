import { useQuery } from '@tanstack/react-query'
import { getMe } from '../api/session'

export const SESSION_QUERY_KEY = ['me'] as const

// The single source of truth for "is someone logged in". Null means logged out.
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
