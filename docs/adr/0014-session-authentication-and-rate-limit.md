# ADR-0014: Session Authentication, Open Signup and Login Rate Limit

- Status: Accepted
- Date: 2026-10-29

## Context

ADR-0003 chose Rails native sessions with `has_secure_password`. This ADR records the details needed to implement it in an API-only application, which does not include cookies or sessions by default.

The owner and their partner are the first users. Signup is open, as requested, so the login endpoint is reachable by anyone and needs protection against password guessing. Rails 8.1 provides `rate_limit` in controllers, but its counters live in `config.cache_store`.

## Decision

- **Model**: `User` with a normalized, unique `email` and a `password_digest` from `has_secure_password`. Passwords must be at least 8 characters.
- **Session**: a signed, encrypted cookie store, configured with `HttpOnly`, `SameSite=Lax` and `secure: Rails.env.production?`.
  - Rails only mounts the cookie and session middleware when `api_only` is off, and `api_only` stays on. The middleware is therefore added explicitly to the Rack stack in `config/application.rb`. This is global: every request passes through it, even when no controller reads the session.
  - Only the authentication controllers read or write the session hash. Other controllers must not use `session`, and they stay stateless by convention.
- **Endpoints** under `/api/v1`: `POST /users` (signup, logs in), `POST /session` (login), `DELETE /session` (logout), `GET /me` (current user or 401).
- **Authorization**: binary for now. `ApplicationController` runs `require_login` for every controller, and public endpoints opt out explicitly (see ADR-0015). No roles.
- **Login errors** use one generic message, so the response does not reveal whether an email exists.
- **Rate limit**: `POST /session` allows 10 attempts per IP every 3 minutes, using `rate_limit` from Rails 8.1.
- **Cache store**: `memory_store` in production, which backs the rate limit counters. Development keeps `memory_store`. Test keeps `null_store`, so the rate limit spec must use its own store.

## Known limitation

Rate limit counters live in the memory of the Puma process. They are reset on every deploy and every restart, because Render's disk is ephemeral and no Redis or Solid Cache is configured.

This means a determined attacker who can cause a restart can reset the limit. Accepted for now because:

- The app has one process and two users, and the attack surface is small.
- Adding Redis or Solid Cache is a new service or a new database schema, which conflicts with the minimal scope of this phase.

This is revisited when the app has more users, or when a module depends on stronger guarantees.

## Consequences

**Positive:**

- No new infrastructure: no Redis, no cache tables.
- Brute-force protection works during normal operation.
- The session cookie is not readable by JavaScript and is not sent cross-site.

**Negative:**

- The limit is reset by deploys and restarts (see above).
- The session middleware runs on every request. It is a small per-request cost, and a reason to keep non-authentication controllers free of session access.
- Signup is open, so anyone who finds the URL can create an account. Acceptable while the app is private and unlisted; revisit before any public launch.

## Alternatives Considered

- **Solid Cache on PostgreSQL**: persistent counters with no new service, but it reintroduces a gem and a schema that were removed in step 1b.
- **Redis**: persistent and standard, but an extra service to run on Render.
- **No rate limit**: simplest, but leaves the login open to unlimited guessing.

## References

- [Rails: Rate limiting in controllers](https://api.rubyonrails.org/classes/ActionController/RateLimiting/ClassMethods.html)
- [Rails: has_secure_password](https://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
