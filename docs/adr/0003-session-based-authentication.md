# ADR-0003: Session-Based Authentication with has_secure_password

- Status: Accepted
- Date: 2026-10-23

## Context

core-hub needs authentication for its owner and for a second user (a shared account for household finances). The frontend and the API will be served from the same site, so cookies can be used safely. Options considered:

1. Rails native session authentication with `has_secure_password`.
2. Devise with JWT tokens.
3. External identity provider (Keycloak, Authentik).

Two users do not justify running an identity provider. JWTs kept in browser storage are exposed to XSS, and avoiding that means rebuilding session semantics on top of them.

## Decision

We will use Rails native session authentication:

- `has_secure_password` (bcrypt) for password hashing.
- Server-side session identifier stored in a signed, encrypted, `HttpOnly` cookie with `SameSite=Lax` (the Rails default).
- Authorization is checked in controllers on each request. Roles are added only when a module needs them.
- No additional authentication gems in phase 1.

Password reset by email is deferred until an email provider is chosen (see ADR-0002 on data ownership).

## Consequences

**Positive:**

- No extra dependencies, so a smaller attack surface and an easier audit.
- Rails-idiomatic code that is easy to find documentation for.
- `HttpOnly` cookies keep the session token away from JavaScript.

**Negative:**

- No MFA out of the box. It can be added later with a gem such as `rotp`.
- Password reset is not available until an email delivery decision is made.
- If the frontend moves to a different domain, CORS and token handling must be redesigned.

## Alternatives Considered

- **Devise**: more features (lockable, recoverable), but several gems and more configuration than a two-user app needs.
- **JWT in a SPA**: a common pattern, but tokens in JavaScript-accessible storage are vulnerable to XSS.
- **Keycloak or Authentik**: strong SSO and MFA, but an extra service to operate.

## References

- [Rails Security Guide: Sessions](https://guides.rubyonrails.org/security.html#sessions)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [ActiveModel::SecurePassword](https://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html)
