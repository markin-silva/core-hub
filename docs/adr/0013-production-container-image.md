# ADR-0013: Production Container Image

- Status: Accepted
- Date: 2026-10-29

## Context

ADR-0009 requires the React build to be served by Rails, from the same origin as the API, with client-side routes falling back to `index.html`. ADR-0002 deploys to Render from a Dockerfile. The production image therefore has to contain the built frontend and the Rails app, and serve both on one port.

Rails is configured as an API-only application (`config.api_only = true`), so it does not render HTML and does not serve `public/` by default. The production environment also forces SSL (`force_ssl`), because Render terminates TLS in front of the app.

## Decision

- **Multi-stage Dockerfile at the repository root.** The first stage builds the frontend with `node:24.22.1-slim` (`npm ci`, `npm run build`). The second stage uses `ruby:4.0.9-slim`, installs production gems only (`BUNDLE_WITHOUT=development:test`), and copies `frontend/dist` into `backend/public/`.
- **Non-root runtime user.** The container runs as an unprivileged user, and the app directory is owned by that user only where it must write (`tmp/`, `log/`).
- **SPA fallback in Rails.** A `GET` catch-all route in `config/routes.rb` returns `index.html` for any path that is not `/api/*`, `/up`, or an existing file in `public/`. Unknown `/api/*` paths keep returning 404.
- **Static files enabled explicitly.** `config.public_file_server.enabled` is set to `true` in `production.rb`, so the API-only app serves the built assets regardless of the environment.
- **SSL is configurable through `FORCE_SSL`.** `config.force_ssl` reads `ENV.fetch("FORCE_SSL", "true") == "true"`. It defaults to `true`, so production behavior does not change. Local validation of the image sets `FORCE_SSL=false`, because there is no TLS terminator on `localhost`.
- **Port from `PORT`.** Puma already reads `PORT`, which Render injects.

## Consequences

**Positive:**

- One image, one service, one origin. Session cookies (ADR-0003) work without CORS.
- The image runs the same way locally and on Render, with the only difference being `FORCE_SSL`.

**Negative:**

- The frontend build is coupled to the backend image, so a frontend-only change redeploys the whole service (already accepted in ADR-0009).
- Rails serves static files, which is less efficient than a CDN. Acceptable at this scale.
- `FORCE_SSL` is an environment switch in production code. It must never be set to `false` on Render. Step 5 will document this in the deploy configuration.

## Alternatives Considered

- **Keep `force_ssl` hard-coded and validate with `X-Forwarded-Proto: https`**: avoids a config switch, but makes the local test depend on a header trick and does not exercise the real redirect path.
- **Separate nginx container for static files**: more efficient, but a third service to run and monitor on Render.

## References

- [Rails: Configuring SSL](https://guides.rubyonrails.org/configuring.html#config-force-ssl)
- [Render: Docker deploys](https://render.com/docs/docker)
