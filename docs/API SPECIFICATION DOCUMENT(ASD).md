# API SPECIFICATION DOCUMENT (API)

**Project Name:** Internship Management & Automation System (IMAS)

**Base URL:** `/api/v1` for internal authenticated endpoints; public endpoints as specified

**Security Level:** High Security / KVKK Compliant

---

## 1. INTRODUCTION
This document specifies the RESTful API for IMAS. It defines all endpoints, request/response formats, authentication, authorization, error handling, and rate limiting requirements. It is aligned with the URD, SRS, SAD, SDD, and DDD.

## 2. CONVENTIONS

### 2.1 Base URL

All internal authenticated endpoints are prefixed with `/api/v1`.

Example: `https://{host}/api/v1/auth/login`

Public endpoints (public verification, employer evaluation token validation and submission) are **outside** `/api/v1` and do not require authentication.

### 2.2 Authentication

The system supports two authentication mechanisms:

- **Browser clients:** Authenticate via an `httpOnly`, `Secure`, `SameSite=Strict` cookie containing a **server-side session ID**. The cookie is set by the server after successful login. The client must also send a `X-CSRF-Token` header for state-changing requests.
- **Non-browser clients:** Authenticate via an `Authorization: Bearer <access_token>` header. The access token is a short-lived JWT containing `session_id`, `user_id`, `department_id`, and `role`. It is validated against the server-side session.

Both mechanisms are validated by the same guard.

### 2.3 CSRF Protection

For all state-changing requests (POST, PUT, PATCH, DELETE) originating from browser clients, the client must include the CSRF token. The server issues a CSRF token on login and can be obtained via `GET /api/v1/auth/csrf`. Failure to provide a valid token results in `403 Forbidden`.

### 2.4 Standard Error Response Format

All error responses use the following JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "correlationId": "uuid"
  }
}
```

Common error codes include:

| HTTP Status | Error Code                 | Description                          |
| ----------- | -------------------------- | ------------------------------------ |
| 400         | `VALIDATION_ERROR`         | Invalid request payload              |
| 401         | `UNAUTHENTICATED`          | Missing or invalid credentials       |
| 403         | `FORBIDDEN`                | Insufficient permissions             |
| 404         | `NOT_FOUND`                | Resource not found                   |
| 409         | `CONFLICT`                 | Resource conflict (duplicate, state) |
| 409         | `INVALID_STATE_TRANSITION` | Illegal workflow transition          |
| 413         | `PAYLOAD_TOO_LARGE`        | File size exceeds limit              |
| 415         | `UNSUPPORTED_MEDIA_TYPE`   | File type not allowed                |
| 429         | `RATE_LIMITED`             | Too many requests                    |
| 500         | `INTERNAL_ERROR`           | Unexpected server error              |
| 503         | `SERVICE_UNAVAILABLE`      | External service unavailable         |

### 2.5 Pagination

List endpoints support pagination via query parameters:

- `page` – page number (1-based, default 1)
- `limit` – number of items per page (default 20, max 100)

Response format:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 2.6 Date and Time

All timestamps are returned in UTC ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`).

Dates (without time) use `YYYY-MM-DD`.

### 2.7 IDs

All resource IDs are UUIDv7 strings.

### 2.8 Tenant Context

For standard roles (Student, Academic), the department context is derived from the authenticated session (`app.current_tenant`), not from client-supplied parameters. Endpoints that require department-specific operations use the session context automatically.

For system-wide Admins using the `app_admin` DB role, if a department-specific operation is needed, the admin must provide the `X-Department-Id` header explicitly.

## 3. RATE LIMITING

- Global rate limit: 100 requests per minute per IP.
- Login and password reset: 5 requests per minute per IP and per user.
- Public verification: 30 requests per minute per IP.
- Employer evaluation submission: 10 requests per minute per token.

## 4. ENDPOINT GROUPS

### 4.1 Authentication & Sessions

| Method | Endpoint                              | Description                                       | Auth                            |
| ------ | ------------------------------------- | ------------------------------------------------- | ------------------------------- |
| POST   | `/api/v1/auth/login`                  | Login with email/password, establishes session    | Public                          |
| POST   | `/api/v1/auth/logout`                 | Logout and revoke session                         | Authenticated                   |
| POST   | `/api/v1/auth/refresh`                | Refresh access token using rotating refresh token | Public (requires refresh token) |
| GET    | `/api/v1/auth/csrf`                   | Get current CSRF token                            | Authenticated                   |
| POST   | `/api/v1/auth/password-reset/request` | Request password reset email                      | Public                          |
| POST   | `/api/v1/auth/password-reset/confirm` | Confirm password reset with token                 | Public                          |
| GET    | `/api/v1/auth/me`                     | Get current user profile                          | Authenticated                   |

#### 4.1.1 Login

**Request:**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response 200 (browser):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "string",
    "lastName": "string",
    "role": "STUDENT",
    "departmentId": "uuid or null"
  },
  "csrfToken": "string"
}
```

Sets `httpOnly` session cookie. `departmentId` is `null` for system-wide Admins.

**Response 200 (non-browser):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "string",
    "lastName": "string",
    "role": "STUDENT",
    "departmentId": "uuid or null"
  },
  "accessToken": "string",
  "refreshToken": "string",
  "csrfToken": "string"
}
```

#### 4.1.2 Refresh

**Request:**

```json
{
  "refreshToken": "string"
}
```

**Response 200:**

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

If the refresh token has already been used or revoked, the server invalidates the entire token chain for the user and returns `401 UNAUTHENTICATED` with error code `TOKEN_REUSE_DETECTED`.

#### 4.1.3 Password Reset Request

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response 202:** `{ "message": "If email exists, reset link sent." }`

The email contains a link with a plaintext token. The server hashes the token before storing in `password_reset_tokens.token_hash`.

#### 4.1.4 Password Reset Confirm

**Request:**

```json
{
  "token": "string",
  "newPassword": "string"
}
```

The server hashes the provided token and compares with stored hash. On success, password is updated and token marked used.

**Response 200:** `{ "message": "Password updated." }`

### 4.2 Users

| Method | Endpoint               | Description                                 | Auth          |
| ------ | ---------------------- | ------------------------------------------- | ------------- |
| GET    | `/api/v1/users`        | List users (filterable by department, role) | Admin         |
| POST   | `/api/v1/users`        | Create user                                 | Admin         |
| GET    | `/api/v1/users/:id`    | Get user details                            | Admin or self |
| PATCH  | `/api/v1/users/:id`    | Update user (name, active, role)            | Admin         |
| POST   | `/api/v1/users/import` | CSV import                                  | Admin         |

#### 4.2.1 Create User

**Request:**

```json
{
  "email": "user@example.com",
  "password": "string",
  "role": "STUDENT | ACADEMIC | ADMIN",
  "firstName": "string",
  "lastName": "string",
  "studentNumber": "string (optional, required for STUDENT)",
  "departmentId": "uuid (optional, required for STUDENT/ACADEMIC; null for system ADMIN)"
}
```

**Response 201:** user object.

#### 4.2.2 CSV Import

**Request:** `multipart/form-data` with `file`.

The import performs an **upsert** by `(department_id, student_number)`. Existing users are updated; new users are created. Invalid rows are reported without affecting valid ones.

**Response 200:**

```json
{
  "imported": 10,
  "errors": [{ "row": 2, "message": "Invalid email" }]
}
```

### 4.3 Companies

| Method | Endpoint                           | Description                                | Auth                   |
| ------ | ---------------------------------- | ------------------------------------------ | ---------------------- |
| GET    | `/api/v1/companies`                | List/search companies                      | Authenticated          |
| POST   | `/api/v1/companies`                | Create company                             | Student/Academic/Admin |
| POST   | `/api/v1/companies/find-or-create` | Find existing or create unverified company | Student/Academic/Admin |
| GET    | `/api/v1/companies/:id`            | Get company                                | Authenticated          |
| PATCH  | `/api/v1/companies/:id`            | Update company                             | Academic/Admin         |
| POST   | `/api/v1/companies/:id/deactivate` | Deactivate company                         | Academic/Admin         |
| POST   | `/api/v1/companies/:id/verify`     | Verify company                             | Admin                  |

#### 4.3.1 List Companies

Query params: `search`, `city`, `industry`, `is_active`, `is_verified`.

#### 4.3.2 Create Company (Student auto-add)

**Request:**

```json
{
  "name": "string",
  "taxNumber": "string (10 digits)",
  "city": "string",
  "industry": "string",
  "address": "string (optional)",
  "website": "string (optional)",
  "contactPerson": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)"
}
```

**Response 201:** company object with `is_verified: false`.

#### 4.3.3 Find-or-Create

**Request:**

```json
{
  "name": "string",
  "taxNumber": "string (10 digits)"
}
```

If a company with the same `taxNumber` exists, returns the existing company. Otherwise creates a new unverified company.

**Response 200 (existing):** company object.
**Response 201 (new):** company object with `is_verified: false`.

### 4.4 Academic Calendars

| Method | Endpoint                      | Description                                           | Auth          |
| ------ | ----------------------------- | ----------------------------------------------------- | ------------- |
| GET    | `/api/v1/calendars`           | List calendars for department                         | Authenticated |
| GET    | `/api/v1/calendars/next-term` | Get next term for the authenticated user's department | Authenticated |
| POST   | `/api/v1/calendars`           | Create calendar                                       | Admin         |
| PATCH  | `/api/v1/calendars/:id`       | Update calendar                                       | Admin         |
| DELETE | `/api/v1/calendars/:id`       | Delete calendar                                       | Admin         |

#### 4.4.1 Create Calendar

**Request:**

```json
{
  "departmentId": "uuid",
  "termName": "2026 Summer",
  "applicationStart": "2026-06-01",
  "applicationEnd": "2026-06-15",
  "internshipStart": "2026-07-01",
  "internshipEnd": "2026-08-15"
}
```

#### 4.4.2 Next Term

For standard roles, the department is derived from the session. For `app_admin`, the `X-Department-Id` header is required.

**Request:**

`GET /api/v1/calendars/next-term`

Headers (admin only): `X-Department-Id: uuid`

**Response 200:**

```json
{
  "id": "uuid",
  "termName": "2026 Fall",
  "applicationStart": "2026-09-01",
  "applicationEnd": "2026-09-15",
  "internshipStart": "2026-10-01",
  "internshipEnd": "2026-11-30"
}
```

Returns `404 NOT_FOUND` if no future term exists.

### 4.5 Holidays

| Method | Endpoint                  | Description                                                 | Auth          |
| ------ | ------------------------- | ----------------------------------------------------------- | ------------- |
| GET    | `/api/v1/holidays`        | List holidays (global + department)                         | Authenticated |
| GET    | `/api/v1/holidays/merged` | Get merged holidays for the authenticated user's department | Authenticated |
| POST   | `/api/v1/holidays`        | Create holiday                                              | Admin         |
| PATCH  | `/api/v1/holidays/:id`    | Update holiday                                              | Admin         |
| DELETE | `/api/v1/holidays/:id`    | Delete holiday                                              | Admin         |

#### 4.5.1 Create Holiday

**Request:**

```json
{
  "departmentId": "uuid or null for global",
  "holidayDate": "2026-07-15",
  "name": "Democracy Day"
}
```

#### 4.5.2 Merged Holidays

For standard roles, the department is derived from the session. For `app_admin`, the `X-Department-Id` header is required.

**Request:**

`GET /api/v1/holidays/merged`

Headers (admin only): `X-Department-Id: uuid`

**Response 200:**

```json
{
  "holidays": [{ "holidayDate": "2026-07-15", "name": "Democracy Day" }]
}
```

Merges global holidays (departmentId null) and department-specific holidays.

### 4.6 Document Types

| Method | Endpoint                              | Description                        | Auth           |
| ------ | ------------------------------------- | ---------------------------------- | -------------- |
| GET    | `/api/v1/document-types`              | List document types for department | Authenticated  |
| POST   | `/api/v1/document-types`              | Create document type               | Admin/Academic |
| PATCH  | `/api/v1/document-types/:id`          | Update document type               | Admin/Academic |
| POST   | `/api/v1/document-types/:id/template` | Upload blank template              | Admin/Academic |
| GET    | `/api/v1/document-types/:id/template` | Download blank template            | Authenticated  |

#### 4.6.1 Create Document Type

**Request:**

```json
{
  "departmentId": "uuid",
  "name": "string",
  "description": "string (optional)",
  "isRequired": true,
  "allowedFileTypes": ["pdf", "jpg", "png"],
  "maxFileSize": 5
}
```

### 4.7 Internship Applications

| Method | Endpoint                                   | Description                                                              | Auth                   |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------ | ---------------------- |
| GET    | `/api/v1/internships`                      | List my internships (student) or department internships (academic/admin) | Authenticated          |
| POST   | `/api/v1/internships`                      | Create draft                                                             | Student                |
| GET    | `/api/v1/internships/:id`                  | Get internship details                                                   | Student/Academic/Admin |
| PATCH  | `/api/v1/internships/:id`                  | Update draft                                                             | Student                |
| POST   | `/api/v1/internships/:id/submit`           | Submit application                                                       | Student                |
| POST   | `/api/v1/internships/:id/withdraw`         | Withdraw application                                                     | Student                |
| POST   | `/api/v1/internships/:id/approve`          | Approve application                                                      | Academic               |
| POST   | `/api/v1/internships/:id/reject`           | Reject application                                                       | Academic               |
| POST   | `/api/v1/internships/:id/request-revision` | Request revision                                                         | Academic               |
| GET    | `/api/v1/internships/:id/history`          | Get status history                                                       | Authenticated          |

#### 4.7.1 Create Draft

**Request:**

```json
{
  "companyId": "uuid",
  "startDate": "2026-07-01",
  "endDate": "2026-08-15"
}
```

#### 4.7.2 Submit Application

No body. Requires all required documents uploaded.

#### 4.7.3 Approve

**Request:**

```json
{
  "comment": "string (optional)"
}
```

#### 4.7.4 Reject

**Request:**

```json
{
  "reason": "string"
}
```

#### 4.7.5 Request Revision

**Request:**

```json
{
  "reason": "string"
}
```

### 4.8 Application Documents (Upload / Review)

| Method | Endpoint                                           | Description                      | Auth             |
| ------ | -------------------------------------------------- | -------------------------------- | ---------------- |
| POST   | `/api/v1/internships/:id/documents`                | Upload new document version      | Student          |
| GET    | `/api/v1/internships/:id/documents`                | List documents (latest versions) | Student/Academic |
| POST   | `/api/v1/application-documents/:documentId/accept` | Accept document                  | Academic         |
| POST   | `/api/v1/application-documents/:documentId/reject` | Reject document with reason      | Academic         |

#### 4.8.1 Upload Document

**Request:** `multipart/form-data`

- `documentTypeId`: UUID
- `file`: file

**Description:** File size is validated against the lower of the global system upload limit (`system_configs.upload_max_mb`) and the Document Type's `max_file_size`. Returns `413 PAYLOAD_TOO_LARGE` or `415 UNSUPPORTED_MEDIA_TYPE` with details.

**Response 201:**

```json
{
  "id": "uuid",
  "documentTypeId": "uuid",
  "versionNumber": 1,
  "status": "PENDING",
  "originalFilename": "string",
  "uploadedAt": "ISO timestamp"
}
```

The server auto-increments `versionNumber` per (internship_id, document_type_id).

#### 4.8.2 Reject Document

**Request:**

```json
{
  "reason": "string"
}
```

### 4.9 Daily Logs

| Method | Endpoint                             | Description      | Auth                    |
| ------ | ------------------------------------ | ---------------- | ----------------------- |
| GET    | `/api/v1/internships/:id/daily-logs` | List daily logs  | Student/Academic        |
| POST   | `/api/v1/internships/:id/daily-logs` | Create daily log | Student                 |
| PATCH  | `/api/v1/daily-logs/:id`             | Update daily log | Student (while ONGOING) |

#### 4.9.1 Create Daily Log

**Request:**

```json
{
  "logDate": "2026-07-01",
  "content": "Worked on..."
}
```

### 4.10 SGK Tracking

| Method | Endpoint                      | Description                         | Auth           |
| ------ | ----------------------------- | ----------------------------------- | -------------- |
| GET    | `/api/v1/sgk`                 | List SGK records (filter by status) | Academic/Admin |
| POST   | `/api/v1/internships/:id/sgk` | Create/update SGK record            | Academic       |
| POST   | `/api/v1/sgk/:id/upload`      | Upload declaration document         | Academic       |
| PATCH  | `/api/v1/sgk/:id/status`      | Update SGK status                   | Academic       |
| GET    | `/api/v1/sgk/:id/history`     | Get status history                  | Academic/Admin |

#### 4.10.1 Update SGK Status

**Request:**

```json
{
  "status": "SUBMITTED | ACTIVE"
}
```

### 4.11 Employer Evaluation

| Method | Endpoint                                                    | Description                      | Auth             |
| ------ | ----------------------------------------------------------- | -------------------------------- | ---------------- |
| POST   | `/api/v1/internships/:id/employer-evaluation/generate-link` | Generate digital evaluation link | Academic         |
| GET    | `/employer-evaluation/validate`                             | Validate token (public)          | Public           |
| POST   | `/employer-evaluation/submit`                               | Submit digital evaluation        | Public (token)   |
| POST   | `/api/v1/internships/:id/employer-evaluation/manual`        | Enter manual evaluation          | Academic         |
| GET    | `/api/v1/internships/:id/employer-evaluation`               | Get evaluation                   | Student/Academic |

#### 4.11.1 Generate Link

**Response 200:**

```json
{
  "email": "employer@example.com",
  "expiresAt": "ISO timestamp"
}
```

#### 4.11.2 Validate Token

**Request:**

`GET /employer-evaluation/validate?token=PLAIN_TOKEN`

The server hashes the plain token and calls `validate_employer_token(hash)`.

**Response 200:**

```json
{
  "internshipId": "uuid",
  "valid": true
}
```

If token invalid/expired/used, returns `404 NOT_FOUND` with a generic error body:

```json
{
  "error": {
    "code": "TOKEN_EXPIRED | TOKEN_USED | NOT_FOUND",
    "message": "Invalid or expired token",
    "correlationId": "uuid"
  }
}
```

#### 4.11.3 Submit Digital Evaluation

**Request:**

```json
{
  "token": "PLAIN_TOKEN",
  "grades": {
    "attendance": "A",
    "effort": "B",
    "timeliness": "A",
    "conduct": "B",
    "teamwork": "C",
    "ethics": "A",
    "self_improvement": "B"
  },
  "comments": "string (optional)"
}
```

Server hashes token and validates before storing evaluation and marking token used.

**Response 200:** `{ "message": "Evaluation submitted." }`

#### 4.11.4 Manual Evaluation

**Request:** `multipart/form-data`

- `employerName`: string
- `grades`: JSON string of grades object
- `comments`: string (optional)
- `scannedSicilFisi`: file (optional)

**Response 201:** evaluation object.

### 4.12 Scoring & Grades

| Method | Endpoint                                 | Description          | Auth             |
| ------ | ---------------------------------------- | -------------------- | ---------------- |
| POST   | `/api/v1/internships/:id/academic-score` | Enter academic score | Academic         |
| GET    | `/api/v1/internships/:id/grade`          | Get final grade      | Student/Academic |

#### 4.12.1 Enter Academic Score

**Request:**

```json
{
  "logQuality": 80,
  "reportQuality": 90
}
```

The system calculates the academic score using weights from the **snapshotted** `grading_data` (not live config), then calculates final score and letter grade.

**Response 200:**

```json
{
  "finalScore": 85.5,
  "letterGrade": "BA"
}
```

### 4.13 PDF Generation

| Method | Endpoint                                   | Description          | Auth          |
| ------ | ------------------------------------------ | -------------------- | ------------- |
| POST   | `/api/v1/internships/:id/preview-pdf`      | Generate preview PDF | Student       |
| POST   | `/api/v1/internships/:id/final-pdf`        | Generate final PDF   | Academic      |
| GET    | `/api/v1/generated-documents/:id/download` | Download PDF         | Authenticated |

#### 4.13.1 Preview PDF

**Response 200:** `application/pdf` file.

#### 4.13.2 Final PDF

**Response 200 (synchronous):** `application/pdf` file.

**Response 202 (asynchronous):**

```json
{
  "jobId": "uuid",
  "status": "PENDING"
}
```

When complete, user is notified via `outbox_events` (email + in-app). The final PDF is stored with verification QR code and SHA-256 hash.

### 4.14 Public Verification

| Method | Endpoint                       | Description              | Auth   |
| ------ | ------------------------------ | ------------------------ | ------ |
| GET    | `/verify/{verification_token}` | Public verification page | Public |

#### 4.14.1 Verify

Supports content negotiation:

- `Accept: text/html` returns HTML page.
- `Accept: application/json` returns JSON.

**Response 200 (JSON):**

```json
{
  "studentName": "string",
  "internshipStatus": "COMPLETED",
  "approvalDate": "ISO timestamp"
}
```

If token invalid, returns `404 NOT_FOUND` with generic message.

### 4.15 Notifications

| Method | Endpoint                         | Description           | Auth          |
| ------ | -------------------------------- | --------------------- | ------------- |
| GET    | `/api/v1/notifications`          | List my notifications | Authenticated |
| PATCH  | `/api/v1/notifications/:id/read` | Mark as read          | Authenticated |
| POST   | `/api/v1/notifications/read-all` | Mark all as read      | Authenticated |

### 4.16 Audit Logs

| Method | Endpoint             | Description     | Auth  |
| ------ | -------------------- | --------------- | ----- |
| GET    | `/api/v1/audit-logs` | List audit logs | Admin |

Query parameters: `from`, `to`, `userId`, `entityType`, `action`.

Admins access via dedicated `app_admin` DB role.

### 4.17 System Configuration

| Method | Endpoint                      | Description            | Auth  |
| ------ | ----------------------------- | ---------------------- | ----- |
| GET    | `/api/v1/system-configs`      | Get all system configs | Admin |
| PATCH  | `/api/v1/system-configs/:key` | Update a system config | Admin |

### 4.18 Reports

| Method | Endpoint                       | Description               | Auth  |
| ------ | ------------------------------ | ------------------------- | ----- |
| GET    | `/api/v1/reports/applications` | Application statistics    | Admin |
| GET    | `/api/v1/reports/companies`    | Company distribution      | Admin |
| GET    | `/api/v1/reports/evaluations`  | Evaluation scores summary | Admin |

## 5. DATA SCHEMAS (DTOs)

Common DTOs referenced above are defined in separate OpenAPI schema files. The schemas are derived from the DDD table definitions and SRS requirements.

## 6. APPENDIX: ERROR CODES

| Code                          | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `INVALID_STATE_TRANSITION`    | Transition not allowed                          |
| `DOCUMENT_NOT_FOUND`          | Verification document not found                 |
| `TOKEN_EXPIRED`               | Employer token expired                          |
| `TOKEN_USED`                  | Employer token already used                     |
| `TOKEN_REUSE_DETECTED`        | Refresh token reuse detected, chain invalidated |
| `ACCOUNT_LOCKED`              | User account locked                             |
| `INVALID_CREDENTIALS`         | Invalid email/password                          |
| `CSRF_INVALID`                | CSRF token missing or invalid                   |
| `UPLOAD_TOO_LARGE`            | File exceeds max size                           |
| `FILE_TYPE_NOT_ALLOWED`       | File type not allowed                           |
| `DUPLICATE_APPLICATION`       | Duplicate application conflict                  |
| `REQUIRED_DOCUMENTS_MISSING`  | Not all required documents uploaded/accepted    |
| `SGK_NOT_ACTIVE`              | SGK status is not ACTIVE                        |
| `EMPLOYER_EVALUATION_MISSING` | Employer evaluation not submitted               |
| `PDF_GENERATION_FAILED`       | PDF generation error                            |

## 7. SECURITY CONSIDERATIONS

- All endpoints use HTTPS/TLS.
- Internal authenticated endpoints use server-side sessions and role guards.
- Admin access via dedicated `app_admin` DB role; no `app.current_role` bypass.
- Public/employer endpoints use SECURITY DEFINER functions.
- CSRF tokens required for browser-based state-changing requests.
- Rate limiting applied globally and per endpoint.
- File upload validation includes type, size, and malware scan (if available).
- All input is validated using DTOs and class-validator.
- Public verification endpoint is outside `/api/v1` and supports content negotiation.

## 8. VERSIONING

API version is specified in URL (`/api/v1`). Public endpoints do not include version prefix. Breaking changes will introduce a new version.

---
