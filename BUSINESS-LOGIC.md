# Business Logic

## Business Rules

### Health Check
- GET `/health-check` returns API status and available endpoints

### User Creation
- New users are assigned a unique ID automatically
- Name is required and must be a non-empty string
- Name is trimmed before saving
- Role is optional; if provided it must be one of `admin` or `user` or `moderator` (400 if invalid)
- If role is not provided, it defaults to `user`
- `email` is required and must be a valid email format (400 if invalid)
- `email` must be unique across all users (409 if already taken)
- Users are created with `active: true` by default
- `createdAt` is set automatically (ISO 8601 timestamp), immutable after creation

### User Update
- User must exist (404 if not found)
- Name is required and must be a non-empty string
- Name is trimmed before saving
- Role is optional; if provided it must be one of `admin` or `user` or `moderator` (400 if invalid)
- If role is not provided, the existing role is preserved (does not revert to default)
- User not found (404) takes priority over name validation (400)
- `updatedAt` is refreshed automatically (ISO 8601 timestamp) on every successful update

### User Deletion
- User must exist (404 if not found)
- After deletion, user cannot be retrieved (GET returns 404)

### Name Validation
- Must be a string
- Must not be empty after trimming

### Role Validation
- Accepts `admin`, `user`, or `moderator`
- Optional for both creation and update
- Invalid values return 400
- Default on creation (when omitted): `user`
- On update (when omitted): existing role is preserved
- Case-insensitive: `Admin`, `ADMIN`, `admin` are all accepted and normalized to `admin` before saving
- Explicit `null` is treated as an invalid value, not as 'omitted' — sending `role: null` returns 400, it does not fall back to the default.

### Email Validation
- Must match standard email format (`local@domain.tld`)
- Must be unique — checked case-insensitively
- Required on creation; optional on update (existing email preserved if omitted)

### Undefined Routes
- Any request to an undefined route returns 404

---

## Technical Notes

### Data Storage
- In-memory array
- Data resets on server restart
- Initial seed data: 3 users (Ayşe, Mehmet, Zeynep)

### ID Generation
- Highest existing ID + 1
- Starts at 1 if no users exist

---

## Testable Scenarios

### User Lifecycle
- Create a user → GET returns the user
- Update a user → GET returns updated data
- Delete a user → GET returns 404
- Delete a user twice → Second DELETE returns 404

### Validation Priority
- PUT with non-existent user and invalid name → 404 (user not found)
- PUT with existing user and invalid name → 400 (name required)

### Edge Cases
- Create user with whitespace-only name → 400
- Create user with leading/trailing spaces → Name is trimmed
- GET non-existent user → 404
- DELETE non-existent user → 404

### User Fields — Lifecycle
- Create a user → response includes `active: true`, `createdAt` timestamp
- List users → inactive users excluded from `GET /users`
- Retrieve an inactive user by id → still returned via `GET /users/:id`
- Update a user's name → `updatedAt` changes; `createdAt` stays the same
- Create user with duplicate email → 409, user not created
- Create user with malformed email (`"not-an-email"`) → 400, user not created

### Role Scenarios
- Create user without role → role defaults to `user`
- Create user with valid role (`admin`) → role saved as given
- Create user with mixed-case role (`Admin`) → normalized and saved as `admin`
- Create user with role `moderator` → role saved as given
- Create user with invalid role (`superadmin`) → 400, user not created
- Create user with `role: null` → 400 (null is not treated as omitted)
- Update user's role only (name unchanged) → role updated, name untouched
- Update user without sending role → existing role is preserved (does not reset to default `user`)
- GET /users → every user object includes a `role` field

### `:id` Parameter Edge Cases

| # | Scenario | Request | Result |
|---|---|---|---|
| 1 | Non-numeric id | `GET /users/abc` | 404 (`NaN` never matches) |
| 2 | Negative id | `GET /users/-1` | 404 |
| 3 | Decimal id | `GET /users/1.5` | 404 |
| 4 | Extremely large id | `GET /users/99999999999999999999` | 404, no crash |
| 5 | Empty id / trailing slash | `GET /users/` | 200 — falls through to list route, not `:id` route |
| 6 | Whitespace id | `GET /users/%20` | 404 (`Number(" ") === 0`, accidentally safe since id `0` doesn't exist) |
| 7 | Injection attempt | `GET /users/1;DROP TABLE users` (URL-encoded) | 404, no crash. **Currently safe only because there is no SQL layer** — must be re-tested once `better-sqlite3` is wired in |

### Malformed Input / Response Consistency

| # | Scenario | Request | Result |
|---|---|---|---|
| 8 | Extra field in body | `POST /users {"name":"Test","isAdmin":true}` | 201, extra field silently ignored (safe by accident, via destructuring — not an intentional mass-assignment guard) |
| 9 | Unsupported method | `PATCH /users/1` | 404 `Route not found` (see Known Issues — 405 would be more correct) |
| 10 | DELETE success response headers | `DELETE /users/:id` | 204, no `Content-Type` header — correct per HTTP spec |
| 11 | Content-Type mismatch, valid JSON body | `POST /users` with `Content-Type: text/plain` and body `{"name":"Test"}` | Body is **not parsed** (middleware only inspects the header, not content). `req.body` is empty/undefined → falls through to normal validation → 400 "Name is required", **not** a JSON parse error. Can be a confusing debugging trap for API consumers who set the wrong header. |

### Routing / Method Semantics

| # | Scenario | Request | Result |
|---|---|---|---|
| 12 | POST on a resource path | `POST /users/4` | 404 `Route not found` — POST is only defined on the collection root (`/users`), not on a specific resource; this is not equivalent to an update (see `PUT /users/:id` for updates) |

---

## Known Issues

### Malformed JSON — Information Disclosure (FIXED)
- **Issue:** Sending malformed JSON with `Content-Type: application/json` triggered Express's default error handler, which returned an HTML response containing the full stack trace and local file system path (OWASP Security Misconfiguration).
- **Fix:** Added a global 4-parameter error-handling middleware `(err, req, res, next)` in `index.js`, registered after all routes. Detects JSON parse failures via `err.type === 'entity.parse.failed'` combined with `err instanceof SyntaxError`, and returns a consistent `{"message": "Invalid JSON payload"}` response with `Content-Type: application/json`. Stack traces are logged server-side only, never sent to the client.
- **Status:** ✅ Fixed and verified via curl (2026-08-28).

### Unsupported HTTP Methods Return 404 Instead of 405
- `PATCH /users/:id` (or any unsupported method on an existing route) returns `404 Route not found` instead of the more semantically correct `405 Method Not Allowed`.
- **Status:** Accepted limitation, not scheduled for fix.

### Dead Code — `if (!users)` Check in GET `/users` (RESOLVED)
- The check `if (!users)` in the users list route was unreachable, since `users` is always an array reference (never `null`/`undefined`). The intended check was likely `if (!users.length)`, but returning 404 for an empty collection would violate REST convention (an empty collection is a valid 200 response).
- **Status:** ✅ Resolved — the `if (!users)` check was silently removed from `router.get('/', ...)` during the `routes/` refactor. The current behavior (always returns 200) is correct per REST convention.