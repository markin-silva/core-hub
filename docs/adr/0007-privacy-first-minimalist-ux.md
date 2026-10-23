# ADR-0007: Privacy-First Philosophy and Minimalist UX

- Status: Accepted
- Date: 2026-10-23

## Context

nexus-hub exists so that its owner keeps full control of personal data and can combine information across life domains later. That goal shapes every architectural choice, so it is recorded here as a guiding principle.

## Decision

- **Data ownership**: all core data is stored in infrastructure we control or can export from at any time. Third-party services are used only when unavoidable (for example, an email provider for password reset), and each one is recorded in its own ADR.
- **No tracking**: no analytics, telemetry, advertising or third-party scripts in the frontend.
- **Minimalist UX**: every screen does one clear job. Features are added only when a real need exists. No speculative customization.
- **Modules are features, not plugins**: each business module (finances, workouts, car maintenance, tasks, music studies) is a discrete feature with its own data model. We do not build a plugin system.
- **Exportable data**: every module must support exporting its data in an open format (JSON or CSV).

## Consequences

**Positive:**

- Full ownership of the data, with no vendor lock-in for core functionality.
- Fewer dependencies and a smaller attack surface.
- A simpler product that is easier to maintain.

**Negative:**

- The owner operates the system, including backups and updates.
- No ready-made integrations with third-party services. Each one must be built or consciously added.
- Some features that exist in commercial apps will be missing on purpose.

## Alternatives Considered

- **SaaS products per domain**: quick to start, but data is spread across vendors and cross-domain insights become hard.
- **Extensible plugin platform**: flexible, but adds complexity that a single-owner product does not need.

## References

- [Local-first software](https://www.inkandswitch.com/essay/local-first/)
