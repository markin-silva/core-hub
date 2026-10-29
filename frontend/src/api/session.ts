import { ApiError, apiRequest } from './client'
import type { User } from './types'

export interface Credentials {
  email: string
  password: string
}

// Returns the current user, or null when there is no session. A 401 with
// code "unauthenticated" is the normal logged-out state, not a failure.
export async function getMe(): Promise<User | null> {
  try {
    return await apiRequest<User>('/me')
  } catch (error) {
    if (error instanceof ApiError && error.code === 'unauthenticated') return null
    throw error
  }
}

export function login(credentials: Credentials): Promise<User> {
  return apiRequest<User>('/session', { method: 'POST', body: JSON.stringify(credentials) })
}

export function signup(credentials: Credentials): Promise<User> {
  return apiRequest<User>('/users', { method: 'POST', body: JSON.stringify(credentials) })
}

export function logout(): Promise<void> {
  return apiRequest<void>('/session', { method: 'DELETE' })
}
