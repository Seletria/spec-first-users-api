# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

* REST API built with Express (entry point: `api/index.js`, routes: `api/routes/users.routes.js` + `api/routes/healthCheck.routes.js`)
* Data storage: in-memory array (see `api/routes/users.routes.js`)
* Test infrastructure: not set up yet
* API testing framework: Playwright

## API Endpoints

Base URL: `http://localhost:3000` (see `api/index.js`). Routes are defined in `api/routes/users.routes.js` and `api/routes/healthCheck.routes.js` using Express Router.

| Method | Endpoint    | Description                                                      | Success            | Errors                                |
| ------ | ----------- | ---------------------------------------------------------------- | ------------------ | ------------------------------------- |
| GET    | `/health-check` | Health check; returns API status and list of available endpoints | 200                | –                                     |
| GET    | `/users/:id` | Returns a single user by numeric id                              | 200                | 404 if user not found                 |
| POST   | `/users`     | Creates a user from `{ name }`; name must be a non-empty string  | 201 + created user | 400 if name invalid                   |
| PUT    | `/users/:id` | Updates an existing user's name from `{ name }`                  | 200 + updated user | 404 if not found, 400 if name invalid |
| DELETE | `/users/:id` | Deletes a user by id                                             | 204 (empty)        | 404 if user not found                 |

### Implementation Notes

* User data currently lives in an in-memory array seeded at module load (`users` in `api/routes/users.routes.js`).
* The data resets when the server restarts.
* New IDs are generated as `max(existing ids) + 1`.
* Name validation is centralized in `isValidName` (`typeof string && trim !== ''`).
* Error messages come from the shared `MESSAGES` constant in `api/routes/users.routes.js`.

## Permissions

```yaml
permission:
  edit: ask

  bash:
    "npm install*": ask
    "npm i *": ask
    "yarn add*": ask
    "pnpm add*": ask
    "npx playwright*": ask
    "git push*": ask
    "git commit*": ask
    "*": allow
```

## Core Behavior Rules

1. **Ask first, act second.**
   Always proceed one step at a time. Explain what you intend to do and get approval BEFORE making changes.

2. **Never silently install packages.**
   Never run `npm install`, `npm i`, `npx playwright`, or any dependency-adding command without explicit user approval.

3. **Git safety.**
   NEVER run `git commit` or `git push` without explicit user confirmation.

4. **Keep changes minimal.**
   Do not perform drive-by refactors, formatting changes, renaming, or unrelated improvements.

5. **Do not assume architectural decisions.**
   If the appropriate test structure or abstraction is unclear, ASK the user before deciding.

6. **Do not modify API implementation to make tests easier.**
   Tests should adapt to the existing API unless the user explicitly requests API changes.

7. **Test failures require approval before modifying tests.**
   When a test fails, first investigate and explain the failure. Do not modify the test, assertions, expected values, or API implementation to make the test pass without explicit user approval.

8. **Do not assume the expected behavior.**
   When the actual API behavior differs from the test expectation, report the difference and ask the user whether the test expectation or the API implementation should be changed.

## API Development

When helping develop the API:

* Respect existing patterns in `api/index.js` and `api/routes/`.
* Do not restructure the API without explicit approval.
* Propose endpoint/route design first and wait for approval before implementing.
* Prefer small, incremental changes.
* When a new dependency is required, explain what it does and why, then wait for explicit approval before installing it.

## Testing & Automation

### Framework

* Use **Playwright** for API testing.
* Use Playwright's `APIRequestContext` for REST API requests.
* Do NOT introduce browser-based UI tests unless explicitly requested.
* Do NOT introduce another test framework unless explicitly requested.

### Test Strategy

* Start with endpoint-level API tests.
* Validate HTTP status codes and response bodies.
* Validate response headers when relevant.
* Test both successful and unsuccessful scenarios.
* Include validation and edge cases where appropriate.
* Tests should verify externally observable API behavior, not implementation details.
* Keep tests independent from the internal `users` array or other implementation details.

### Test Architecture

* Do not introduce Page Object Model for API tests unless explicitly requested.
* Prefer simple test files initially.
* Introduce fixtures, helpers, or shared abstractions only when there is clear duplication or a demonstrated need.
* Do not create abstractions speculatively.

### Testing Roadmap

Work incrementally and confirm each step with the user:

1. Set up Playwright for API testing.
2. Verify the API can be started and reached by the tests.
3. Create the first API test.
4. Add positive test scenarios.
5. Add negative and validation scenarios.
6. Add edge cases where appropriate.
7. Refactor test structure only if duplication or complexity requires it.
8. Add npm test scripts once the test setup is stable.
9. Add CI automation only after the local test suite is stable.

## Working Style

* Before making changes, explain what you plan to change and why.
* Make one logical change at a time.
* After each change, report what was changed and whether verification was performed.
* If a command may modify files, install dependencies, or affect Git state, ask for approval when required by the permissions above.
* If requirements are ambiguous, ask instead of guessing.
