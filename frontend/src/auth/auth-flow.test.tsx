import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'

const ana = { id: 1, email: 'ana@example.com' }

const unauthenticated = {
  type: 'about:blank',
  title: 'Unauthorized',
  status: 401,
  detail: 'You must be logged in to do this.',
  code: 'unauthenticated',
}

const invalidCredentials = {
  type: 'about:blank',
  title: 'Invalid credentials',
  status: 401,
  detail: 'The email or password is incorrect.',
  code: 'invalid_credentials',
}

function problem(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}

// A fake server keyed by method and path, so each test states exactly what the API returns.
function fakeApi(routes: Record<string, () => Response>) {
  const fetchMock = vi.fn((input: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${input}`
    const handler = routes[key]
    if (!handler) throw new Error(`Unexpected request: ${key}`)
    return Promise.resolve(handler())
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('auth flow', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('redirects a logged-out visitor from the home page to login', async () => {
    fakeApi({
      'GET /api/v1/me': () => problem(unauthenticated, 401),
      'GET /api/v1/health': () => new Response(JSON.stringify({ status: 'ok' })),
    })

    renderAt('/')

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
  })

  it('logs in and shows the home page', async () => {
    fakeApi({
      'GET /api/v1/me': () => problem(unauthenticated, 401),
      'POST /api/v1/session': () => new Response(JSON.stringify(ana), { status: 201 }),
      'GET /api/v1/health': () => new Response(JSON.stringify({ status: 'ok' })),
    })

    renderAt('/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'ana@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Logged in as ana@example.com')).toBeInTheDocument()
  })

  it('shows the invalid credentials message from the problem response', async () => {
    fakeApi({
      'GET /api/v1/me': () => problem(unauthenticated, 401),
      'POST /api/v1/session': () => problem(invalidCredentials, 401),
      'GET /api/v1/health': () => new Response(JSON.stringify({ status: 'ok' })),
    })

    renderAt('/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'ana@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password is incorrect.',
    )
  })

  it('signup logs the user in and lands on the home page', async () => {
    fakeApi({
      'GET /api/v1/me': () => problem(unauthenticated, 401),
      'POST /api/v1/users': () => new Response(JSON.stringify(ana), { status: 201 }),
      'GET /api/v1/health': () => new Response(JSON.stringify({ status: 'ok' })),
    })

    renderAt('/signup')
    await userEvent.type(await screen.findByLabelText('Email'), 'ana@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByText('Logged in as ana@example.com')).toBeInTheDocument()
  })

  it('maps signup field errors from problem details to the matching input', async () => {
    fakeApi({
      'GET /api/v1/me': () => problem(unauthenticated, 401),
      'POST /api/v1/users': () =>
        problem(
          {
            type: 'about:blank',
            title: 'Validation failed',
            status: 422,
            detail: 'Some fields are invalid.',
            code: 'validation_failed',
            errors: { password: ['is too short (minimum is 8 characters)'] },
          },
          422,
        ),
    })

    renderAt('/signup')
    await userEvent.type(await screen.findByLabelText('Email'), 'ana@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByText('is too short (minimum is 8 characters)')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
