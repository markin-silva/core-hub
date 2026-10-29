# ADR-0015: API Error Contract

- Status: Accepted
- Date: 2026-10-29

## Context

The API needs one error format that the React frontend can rely on. Without one, each controller invents its own shape (`{ error: ... }`, `{ errors: [...] }`), and the frontend has to handle each case separately. Errors also need to be translated (ADR-0007 requires the UI to be in the owner's language, and Portuguese is the working language of the maintainer).

## Decision

- **Format**: RFC 9457 Problem Details, served with `Content-Type: application/problem+json`. Each error body has:
  - `type`: a URI identifying the error class. Use `about:blank` until we publish documentation.
  - `title`: a short, human-readable summary. Translated.
  - `status`: the HTTP status code, as a number.
  - `detail`: a human-readable explanation for this occurrence. Translated.
  - `code`: a stable, machine-readable identifier in `snake_case` (for example `invalid_credentials`). The frontend branches on this field, never on `title` or `detail`.
  - `errors` (optional): field-level validation messages, keyed by attribute name, present only for validation failures.
- **One handler**: `ApplicationController` rescues known exceptions with `rescue_from` and renders the Problem Details body. Controllers do not render errors themselves. Unhandled exceptions still produce a generic 500.
- **Secure by default**: `ApplicationController` runs `before_action :require_login`. A public endpoint opts out with an explicit `skip_before_action :require_login`. A new controller is therefore protected unless its author removes the protection on purpose.
- **Internationalization**: messages live in `config/locales/en.yml` and `config/locales/pt-BR.yml`, keyed under `errors.<code>`. The locale is taken from the `Accept-Language` header, limited to the available locales, and falls back to English. The `code` is never translated.
- **Validation messages** (ActiveModel and ActiveRecord keys such as `errors.messages.too_short`) are translated the same way. The `errors` hash contains only the message, without the attribute name, because the key already identifies the field (`{"password": ["is too short ..."]}`).
- **Locale timing**: Rails resolves validation messages when the errors hash is built, not when validation runs. The error handler therefore builds the hash inside the request locale. This is a deliberate dependency on `requested_locale` from `ApplicationController`.

## Consequences

**Positive:**

- The frontend has one error shape, and it branches on a stable `code`.
- Translation does not affect client logic, because logic uses `code`.
- A new authenticated endpoint is protected without any extra code.

**Negative:**

- `application/problem+json` must be accepted by the frontend HTTP client. A fetch wrapper does this once.
- Every new error case needs a `code` and a translation in each locale. Tests must check that the locales contain the same keys.
- `require_login` moves from `Authenticatable` into `ApplicationController`, so the concern no longer enables anything by itself. This supersedes the wording in ADR-0014 about where authentication is enforced.

## Alternatives Considered

- **Custom envelope** (`{ "error": { "code", "message" } }`): simple and common, but not a standard, so every consumer needs documentation of its shape.
- **JSON:API error objects**: a full specification, more structure than this project needs.
- **Translating `code` on the server only**: rejected, because the frontend would then branch on text that changes with the locale.

## References

- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [Rails Internationalization guide](https://guides.rubyonrails.org/i18n.html)
