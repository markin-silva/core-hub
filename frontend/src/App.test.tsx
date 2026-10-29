import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows checking while the health request is in flight', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )

    render(<App />)

    expect(screen.getByText(/checking/)).toBeInTheDocument()
  })

  it('shows online when the API responds with ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }))),
    )

    render(<App />)

    expect(await screen.findByText(/online/)).toBeInTheDocument()
  })

  it('shows unavailable when the API responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 503 }))),
    )

    render(<App />)

    expect(await screen.findByText(/unavailable/)).toBeInTheDocument()
  })

  it('shows unavailable when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('network down'))),
    )

    render(<App />)

    expect(await screen.findByText(/unavailable/)).toBeInTheDocument()
  })
})
