# ADR-0009: Rails Serves the Vite Build, API Under /api/v1

- Status: Accepted
- Date: 2026-10-23

## Context

Session cookies (ADR-0003) work best when the frontend and the API share an origin. A single production service also keeps operations simple on Render (ADR-0002).

## Decision

- The React app is built by Vite and the output is copied into `backend/public`, served by Rails.
- Rails falls back to `index.html` for non-API, non-asset paths so client-side routes survive a page refresh.
- All API routes live under `/api/v1`.
- In development, the Vite dev server proxies `/api` to the backend, preserving the same-origin behavior.

## Consequences

**Positive:**

- One service to deploy and monitor.
- No CORS configuration and no cross-site cookie concerns.
- Versioned API prefix leaves room for breaking changes.

**Negative:**

- Frontend and backend deploy together, even for a frontend-only change.
- Rails serves static assets, which a CDN or a static host would do more efficiently. Acceptable at this scale.

## Alternatives Considered

- **Separate static site on Render**: needs subdomains on the same site for cookies, plus CORS.
- **Nginx in front of both**: clean routing, but a third service to maintain.

## References

- [Vite: Building for Production](https://vite.dev/guide/build.html)
- [Rails API-only applications](https://guides.rubyonrails.org/api_app.html)
