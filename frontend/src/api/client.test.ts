import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './client'

function mockFetch(response: Response) {
  const fetchMock = vi.fn(() => Promise.resolve(response))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('apiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the session cookie and the browser language', async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ id: 1, email: 'ana@example.com' })))

    await apiRequest('/me')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/me',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Accept-Language': navigator.language }),
      }),
    )
  })

  it('returns the parsed body on success', async () => {
    mockFetch(new Response(JSON.stringify({ id: 1, email: 'ana@example.com' }), { status: 200 }))

    await expect(apiRequest('/me')).resolves.toEqual({ id: 1, email: 'ana@example.com' })
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetch(new Response(null, { status: 204 }))

    await expect(apiRequest('/session', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws an ApiError carrying the problem code and field errors', async () => {
    const problem = {
      type: 'about:blank',
      title: 'Validation failed',
      status: 422,
      detail: 'Some fields are invalid.',
      code: 'validation_failed',
      errors: { password: ['is too short (minimum is 8 characters)'] },
    }
    mockFetch(
      new Response(JSON.stringify(problem), {
        status: 422,
        headers: { 'Content-Type': 'application/problem+json' },
      }),
    )

    const error = await apiRequest('/users', { method: 'POST' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      code: 'validation_failed',
      errors: { password: ['is too short (minimum is 8 characters)'] },
    })
  })

  it('wraps a non-JSON error body as an ApiError instead of a parse error', async () => {
    mockFetch(new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }))

    const error = await apiRequest('/me').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 502, code: 'unexpected_response' })
  })
})
