import type { ProblemDetails } from './types'

// Error thrown for any non-2xx response. Callers branch on `code`, never on `title` or `detail`.
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly errors: Record<string, string[]>

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title)
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.code
    this.errors = problem.errors ?? {}
  }
}

const API_BASE = '/api/v1'

// Single entry point for every request. The session cookie is HttpOnly, so it only
// travels with `credentials: 'include'`, and the error body is always problem+json.
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json, application/problem+json',
      'Accept-Language': navigator.language,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  if (response.ok) {
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  throw new ApiError(await readProblem(response))
}

// A proxy or gateway can return a non-JSON body (for example HTML on a 502). Fall back to
// a generic problem so every failure still reaches callers as an ApiError.
async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    return (await response.json()) as ProblemDetails
  } catch {
    return {
      type: 'about:blank',
      title: response.statusText || 'Request failed',
      status: response.status,
      code: 'unexpected_response',
    }
  }
}
