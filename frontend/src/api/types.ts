// Problem Details (RFC 9457) as defined by ADR-0015.
export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail?: string
  code: string
  errors?: Record<string, string[]>
}

export interface User {
  id: number
  email: string
}
