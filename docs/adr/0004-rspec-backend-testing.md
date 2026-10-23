# ADR-0004: RSpec for Backend Testing

- Status: Accepted
- Date: 2026-10-23

## Context

Rails ships with Minitest, which is simple and dependency-free. RSpec is the most common choice in professional Rails projects, which matters for readability and for finding examples when we need help. We want the test setup to match what a Rails team would expect.

## Decision

We will test the backend with RSpec, plus:

- `factory_bot_rails` for test data.
- `shoulda-matchers` for model validation and association specs.
- Request specs (not controller specs) for API endpoints.
- Transactional tests (Rails default) for database isolation. We will not add DatabaseCleaner.

The exact versions and configuration are set up in the testing step, which will get its own commit.

## Consequences

**Positive:**

- Descriptive `describe` / `context` / `it` structure that doubles as documentation.
- Request specs test the real HTTP contract the frontend depends on.
- Transactional tests make the suite fast without an extra gem.

**Negative:**

- Three extra gems to keep up to date.
- Boot time is slower than Minitest. Spring or `bin/rails` preloading can offset it.

## Alternatives Considered

- **Minitest**: built in and minimal. Good for Rails itself, but less expressive for the kind of specs we will write.

## References

- [RSpec](https://rspec.info/)
- [factory_bot](https://github.com/thoughtbot/factory_bot)
- [shoulda-matchers](https://github.com/thoughtbot/shoulda-matchers)
