# SYSTEM DESIGN DOCUMENT (SDD)

**Project Name:** Internship Management & Automation System (IMAS)

**Security Level:** High Security / KVKK Compliant

---

## 1. INTRODUCTION

### 1.1 Purpose

This System Design Document (SDD) describes the detailed operational design of the Internship Management & Automation System (IMAS). It bridges the gap between the high‑level architecture defined in the SAD and the precise API contracts defined in the API Specification.

The SDD answers **how** the system works in real operational terms:

- How each role interacts with the system, step by step.
- What happens during each workflow transition.
- How documents are reviewed and rejected.
- How the QR code is generated and verified.
- How the system behaves under errors, attacks, or infrastructure failure.
- What notifications are sent and when.

### 1.2 Scope

This document covers:

- Role‑based user journeys
- Screen flow maps
- Detailed internship state machine
- Document management and per‑document review
- QR code generation and verification flow
- PDF generation flow (preview and final)
- Company registry behaviour
- Notification triggers and delivery
- Error handling and edge cases
- Security threat model and mitigations
- Resilience, fallback, and retry strategies

### 1.3 References

- User Requirements Document (URD)
- Software Requirements Specification (SRS)
- Software Architecture Document (SAD)
- Database Design Document (DDD)
- API Specification Document (API)

---

## 2. DESIGN PRINCIPLES

- **Zero Trust:** Every request is validated, authorized, and tenant‑scoped at the database layer.
- **Defense in Depth:** Security controls exist at the UI, API, application, database, and infrastructure levels.
- **Fail Secure:** If a security control cannot be evaluated, access is denied.
- **Immutable Records:** Critical records, especially audit logs and finalized documents, cannot be altered.
- **User‑Centric Workflow:** The system reduces administrative workload by guiding users through one clear step at a time.
- **Trusted Context:** Tenant and role context derive from server‑side session, not from client‑supplied values.
- **Circuit Breaker:** External services are wrapped with circuit breakers; failures are handled gracefully.
- **Outbox Pattern:** Notifications and async jobs are persisted in an outbox before execution to guarantee delivery.

---

## 3. USER ROLES & PERMISSIONS

| Role | Description | Primary System Abilities |
|------|-------------|--------------------------|
| **Student** | University student performing internship | Create applications, upload documents, fill daily logs, preview Staj Defteri, view results |
| **Academic / Commission** | Department staff responsible for internship approval and grading | Review applications and documents, manage SGK, generate employer evaluation links, enter manual grades, finalize grades and PDF |
| **Admin** | System administrator | Manage departments, users, companies, calendars, holidays, document types, system configuration, audit logs, reports |
| **Employer** | External company representative | Submit evaluation via secure one‑time link |
| **Public Verifier** | Person scanning QR code | Verify document authenticity via public page |

> **Admin scope:** System‑wide Admins may have `department_id = NULL`. They access tenant data via the dedicated `app_admin` DB role, which bypasses RLS.

---

## 4. COMPANY REGISTRY BEHAVIOUR

The `companies` table is a shared university‑wide registry.

### 4.1 Student Application with New Company

When a student applies for an internship at a company that does not yet exist in the registry:

1. The student enters the company details in the application form.
2. The system checks if a company with the same name and tax number already exists.
3. If no match exists, the system creates a new `companies` record with:
   - `is_active = TRUE`
   - `is_verified = FALSE`
4. The internship application references this newly created company.
5. The new company remains available for future students.
6. An academic or admin can later mark the company as `is_verified = TRUE` after manual validation.

### 4.2 Academic / Admin Company Management

- Academics and admins can add, edit, and deactivate companies.
- Deactivated companies are not selectable in new applications but remain visible in historical records.
- Company records are department‑agnostic; no RLS applies to `companies`.
- **Find‑or‑Create:** The API provides `POST /api/v1/companies/find-or-create` to avoid duplicate tax numbers.

---

## 5. DETAILED STATE MACHINE

Internship records pass through the following states:

```
DRAFT
  → APPLIED
  → REVISION
  → APPROVED
  → REJECTED
  → ONGOING
  → EVALUATION
  → GRADED
  → COMPLETED
  → WITHDRAWN
```

`REJECTED`, `COMPLETED`, and `WITHDRAWN` are terminal states.

### 5.1 State Transition Table

| From | To | Allowed By | Guard Conditions | Post‑Transition Actions |
|------|----|-----------|------------------|--------------------------|
| (none) | DRAFT | Student | Student authenticated; department calendar active | Internship created with status `DRAFT` |
| DRAFT | APPLIED | Student | All required fields complete; all required documents uploaded; application window open | Status set to `APPLIED`; notification sent to commission |
| DRAFT | WITHDRAWN | Student | Student chooses to discard draft | Status set to `WITHDRAWN`; record retained, not deleted |
| APPLIED | REVISION | Academic | Commission selects “Request Revision” and provides reason | Status set to `REVISION`; student notified |
| REVISION | APPLIED | Student | Student updates needed data/documents and resubmits | Status set to `APPLIED`; notification sent to commission |
| APPLIED | REJECTED | Academic | Commission selects “Reject” and provides reason | Status set to `REJECTED`; student notified; record closed |
| APPLIED | WITHDRAWN | Student | Student withdraws before approval | Status set to `WITHDRAWN`; commission notified |
| APPLIED | APPROVED | Academic | All required documents `ACCEPTED`; commission approves | Status set to `APPROVED`; `approved_at` set; student notified; SGK entry becomes expected |
| APPROVED | ONGOING | Scheduled job / Academic | `sgk_tracking.status = ACTIVE`; current date ≥ `internship.start_date` | Status set to `ONGOING`; daily log enabled; notification sent to student |
| ONGOING | EVALUATION | Student / System | Current date ≥ `internship.end_date`; student submits Staj Defteri | Status set to `EVALUATION`; all daily logs become read‑only; employer evaluation initiated |
| EVALUATION | GRADED | Academic | Employer evaluation received; academic score entered | Status set to `GRADED`; final grade recorded; notification sent to student |
| GRADED | COMPLETED | Academic / System | Final PDF generated and archived | Status set to `COMPLETED`; record locked; verification QR available |
| (any non‑terminal) | WITHDRAWN | Student (only DRAFT/APPLIED) or Admin (for audit) | Admin can mark withdrawn with reason | Status set to `WITHDRAWN`; record retained |

### 5.2 Invalid Transitions

Any transition not listed above is rejected with:

- HTTP `409 Conflict`
- Error code `INVALID_STATE_TRANSITION`

All transitions are recorded in `internship_status_history` with `from_status`, `to_status`, `reason`, `changed_by`, `changed_at`.

### 5.3 Automatic Transition Job (APPROVED → ONGOING)

- A scheduled job runs periodically (e.g., every hour).
- It finds internships with `status = APPROVED`, `sgk_tracking.status = ACTIVE`, and `start_date <= today`.
- For each eligible internship, it transitions to `ONGOING`.
- If the job fails, it retries up to 3 times with exponential backoff.
- On final failure, it raises an administrative alert/notification.

---

## 6. USER JOURNEYS

### 6.1 Student Journey

#### 6.1.1 Login

1. Student visits `/login`.
2. Enters email and password.
3. System validates credentials via `AuthService`.
4. On success, system:
   - Creates a server‑side session record.
   - Sets `httpOnly`, `Secure`, `SameSite=Strict` cookie containing the session ID.
   - Returns CSRF token.
   - Redirects to Student Dashboard.
5. On failure, system:
   - Returns generic error “Invalid email or password.”
   - Increments failed login counter.
   - Locks account after configurable failed attempts.

#### 6.1.2 Create Application

1. Student clicks “New Application”.
2. System checks current academic calendar:
   - If application window closed, form is read‑only and submit disabled.
3. Student selects company:
   - Searches existing companies.
   - If company not found, uses find‑or‑create flow to add new company.
4. Student selects internship start/end dates.
5. System validates:
   - Dates do not overlap with academic term.
   - Date range meets department working‑day requirement (`min_internship_duration_working_days`), using merged holidays.
   - No duplicate active internship.
   - Internship can be completed before next term (calls `CalendarService.getNextTerm`).
6. Student uploads required documents (based on department `document_types`).
7. Student clicks “Save Draft” or “Submit”.

#### 6.1.3 Document Upload

1. Student uploads a document for a required document type.
2. System validates file type and size against effective limit (min(global, document type max)).
3. System stores file in MinIO/local storage through `IFileStorage` (with Circuit Breaker).
4. System creates a new versioned `application_documents` record:
   - `internship_id`
   - `document_type_id`
   - `file_path`
   - `version_number`
   - `status = PENDING`
5. Student sees latest document status in checklist.

#### 6.1.4 Submit Application

1. Student clicks “Submit”.
2. System verifies:
   - All required fields present.
   - All required document types have at least one document with latest status `PENDING` or `ACCEPTED`.
3. If all checks pass:
   - Status set to `APPLIED`.
   - Notification emailed to commission.
   - In‑app notification shown to student.
4. If checks fail:
   - User sees list of missing items.

#### 6.1.5 Track Application

Student dashboard lists all applications with status badges. Clicking an application shows:

- Application details
- Document checklist with latest status
- Commission comments / rejection reasons
- Current workflow step
- Status history

#### 6.1.6 Daily Log

1. Student opens “Daily Log” for an `ONGOING` internship.
2. System shows calendar / list of working days.
3. Student writes daily work description using rich text editor.
4. System saves `daily_logs` record.
5. Student can edit logs until internship enters `EVALUATION`.

#### 6.1.7 Preview Staj Defteri

1. Student opens “Preview Staj Defteri”.
2. System generates a preview PDF from current data.
3. Student reviews and can download draft.
4. Preview has **no** official verification QR code.
5. When ready, student clicks “Submit Staj Defteri”.
6. Status changes to `EVALUATION`.

### 6.2 Academic / Commission Journey

#### 6.2.1 Pending Applications

1. Academic logs in and selects “Pending Applications”.
2. System lists internships with status `APPLIED` for their department (RLS enforced).
3. Academic opens an application.

#### 6.2.2 Document Review

1. Academic sees checklist of uploaded documents with version history.
2. For each latest document:
   - Click “Accept” or “Reject”.
   - If reject, enter reason.
3. System updates latest `application_documents.status`.
4. If any required document is rejected, application remains `APPLIED`.
5. System notifies student about rejected documents.

#### 6.2.3 Approve, Request Revision, Reject, or Withdraw

1. After document review, academic can:
   - Approve → status becomes `APPROVED` (only if all required documents are `ACCEPTED`). Sets `approved_at`.
   - Request Revision → status becomes `REVISION` with reason.
   - Reject → status becomes `REJECTED` with reason (terminal state).
   - (Admin only) Withdraw → status becomes `WITHDRAWN` with reason.

#### 6.2.4 SGK Management

1. Academic opens “Insurance Tracking”.
2. System lists students with status `APPROVED`.
3. Academic uploads SGK entry declaration.
4. When SGK confirmation received, academic sets status to `ACTIVE`.
5. System allows transition to `ONGOING` only after SGK ACTIVE.
6. Each SGK status change is recorded in `sgk_status_history`.

#### 6.2.5 Employer Evaluation

**Digital Method:**

1. Academic clicks “Generate Employer Link”.
2. System creates `employer_tokens` row with `expires_at <= now + 7 days`.
3. System emails secure link to employer.
4. Employer submits evaluation via token link.

**Manual Method:**

1. Academic clicks “Enter Manual Evaluation”.
2. Enters employer name and 7 letter grades.
3. Optionally uploads scanned Sicil Fişi.
4. System records who entered the data and timestamp.

#### 6.2.6 Grade Finalisation

1. Academic enters academic score (criteria weights from `department_configs`).
2. System checks employer score exists.
3. System calculates final score and letter grade using snapshotted `grading_data`.
4. Academic confirms grade finalisation.
5. Status set to `GRADED`.
6. System notifies student.

#### 6.2.7 Generate Final PDF

1. Academic clicks “Generate Final Staj Defteri”.
2. System verifies internship is in `GRADED` state.
3. System generates final PDF with official QR code and verification UUID.
4. System stores PDF and metadata in `documents` table (including SHA‑256 hash).
5. Status set to `COMPLETED`.
6. Record locked.

### 6.3 Admin Journey

#### 6.3.1 Department & User Management

- Admin can create departments.
- Admin can create users (Student, Academic, Admin).
- System‑wide Admin may have `department_id = NULL`.
- Admin can deactivate/reactivate users.
- Admin can assign users to departments.

#### 6.3.2 Calendar & Holiday Management

- Admin can create academic calendars per department.
- Admin can add public holidays (global, `department_id = NULL`).
- Admin can add department‑specific holidays.

#### 6.3.3 Document Type Management

- Admin and Academics can define document types per department.
- Each type has:
  - Name
  - Description
  - Required flag
  - Allowed file types
  - Max size
  - Whether a blank template is available
- Admin/Academic can upload blank templates.

#### 6.3.4 Company Management

- Admin can review unverified companies.
- Admin can edit, verify, deactivate companies.

#### 6.3.5 System Configuration

- Admin can configure via `system_configs`:
  - Password policy
  - Session timeout (default 30 minutes)
  - Upload limits
  - Employer token lifetime (max 7 days)
  - Global settings
- Admin can configure per department via `department_configs`:
  - Grading weights
  - Letter grade scale
  - `min_internship_duration_working_days`

#### 6.3.6 Audit Log Viewer

- Admin can view immutable audit logs using `app_admin` DB role.
- Admin cannot modify or delete logs.

#### 6.3.7 Reports

- Admin can view:
  - Number of applications by department/status
  - Average internship duration
  - Company distribution
  - Evaluation scores

### 6.4 Employer Journey

1. Employer receives email with link:
   `{PUBLIC_BASE_URL}/employer-evaluation/validate?token=PLAIN_TOKEN`
2. Employer opens link.
3. System hashes token and calls `validate_employer_token` SECURITY DEFINER function.
4. System shows evaluation form.
5. Employer fills 7 criteria.
6. Employer submits.
7. System stores evaluation.
8. Token marked used.
9. System shows success message.

### 6.5 Public Verifier Journey

1. Person scans QR code on printed document.
2. Browser opens:
   `{PUBLIC_BASE_URL}/verify/{verification_token}`
3. System looks up document by token using `verify_document` SECURITY DEFINER function.
4. If valid:
   - Shows green success page (HTML or JSON based on `Accept` header).
   - Displays Student Name, Internship Status, Approval Date.
5. If invalid:
   - Shows red “Document not found or invalid.”
   - Returns 404.

---

## 7. QR CODE GENERATION & VERIFICATION FLOW

### 7.1 Generation Flow

Trigger: Academic clicks “Generate Final Staj Defteri”.

1. Backend generates a unique `verification_token` (UUIDv7).
2. Backend saves it in `documents.verification_token` with document metadata.
3. Backend constructs verification URL using configuration:
   `{PUBLIC_BASE_URL}/verify/{verification_token}`
4. Backend uses Node.js `qrcode` library.
5. Library converts URL to a Base64 PNG image.
6. Backend passes QR image data to Typst.
7. Typst stamps QR code onto the footer of the PDF.
8. Backend computes SHA‑256 hash of the PDF and stores it in `documents.content_hash`.
9. PDF is stored.
10. QR code becomes active only after PDF is archived and internship is `COMPLETED`.

### 7.2 Verification Flow

Trigger: Someone scans QR code.

1. Phone opens verification URL.
2. Request reaches public verification endpoint (outside `/api/v1`).
3. Backend calls `verify_document(token)` SECURITY DEFINER function.
4. Function returns allowed fields only if token valid.
5. If found:
   - Returns 200 OK.
   - Displays Student Name, Internship Status, Approval Date.
6. If not found:
   - Returns 404 Not Found.
   - Displays generic “Document not found or invalid.”
7. Public verification endpoint is rate‑limited.
8. Verification does not require login.

---

## 8. PDF GENERATION FLOW

### 8.1 Preview PDF (Student)

1. Student clicks “Preview Staj Defteri”.
2. Backend collects current internship data.
3. Backend calls `IDocumentGenerator.generate(data)`.
4. Typst creates preview PDF.
5. PDF returned to browser for review.
6. No QR code and no final document record created.
7. Student can repeat preview unlimited times.

### 8.2 Final PDF (Academic)

1. Academic clicks “Generate Final Staj Defteri”.
2. Backend verifies internship is in `GRADED` state.
3. Backend generates verification UUID.
4. Backend creates QR code PNG.
5. Backend passes QR image to Typst.
6. Typst generates final PDF.
7. Backend computes SHA‑256 hash of the PDF.
8. Backend stores PDF in MinIO/local disk.
9. Backend inserts `documents` record with hash.
10. Internship status changes to `COMPLETED`.
11. Document is immutable.

### 8.3 PDF Generation Timeout / Failure

- If generation exceeds 2 seconds, backend triggers asynchronous job.
- Frontend receives `202 Accepted` with jobId.
- When job completes, user notified via outbox/notification.
- If generation fails, error is logged and user sees retry option.

---

## 9. DOCUMENT MANAGEMENT FLOW

### 9.1 Document Status Lifecycle

```
PENDING
  → ACCEPTED
  → REJECTED
```

- `PENDING` – uploaded, waiting review.
- `ACCEPTED` – reviewed and approved.
- `REJECTED` – reviewed and rejected with reason.

### 9.2 Versioning & Resubmission

- Each upload creates a new versioned row with incrementing `version_number`.
- The latest version is considered current for review.
- If rejected, student can upload a new version; its status is `PENDING`.
- Full history of all versions is retained for audit.

---

## 10. NOTIFICATION TRIGGERS

| Event | Recipient | Channel |
|-------|-----------|---------|
| Application Submitted | Commission | Email + In‑app |
| Document Rejected | Student | Email + In‑app |
| Application Approved | Student | Email + In‑app |
| Application Rejected | Student | Email + In‑app |
| Revision Requested | Student | Email + In‑app |
| SGK Active | Student | Email + In‑app |
| Employer Link Generated | Employer | Email only |
| Employer Evaluation Submitted | Academic | Email + In‑app |
| Final Grade Ready | Student | Email + In‑app |
| PDF Generated | Academic/Admin | Email + In‑app |
| Job Failure (auto ONGOING transition) | Admin | Email + In‑app |

All email notifications are processed asynchronously via Outbox pattern with retry.

---

## 11. ERROR HANDLING & EDGE CASES

| Scenario | System Behaviour |
|----------|------------------|
| Invalid login | Generic “Invalid email or password.” |
| Account locked | “Too many attempts. Try again later.” |
| File too large | 413 Payload Too Large with max size info |
| Unsupported file type | 415 Unsupported Media Type |
| Duplicate application | 409 Conflict with clear message |
| Invalid state transition | 409 Conflict `INVALID_STATE_TRANSITION` |
| Unauthorized access | 403 Forbidden |
| Record not found | 404 Not Found |
| PDF generation timeout | 202 Accepted, async job |
| Storage service down | 503 Service Unavailable, retry later; metadata not lost |
| Email service down | 503, queued in outbox, retry later |
| Database connection lost | 503, fallback page |
| Invalid CSRF token | 403 Forbidden |
| Public verification invalid | 404 generic message |
| Employer token expired/used | 404 generic message |
| Refresh token reuse | 401 `TOKEN_REUSE_DETECTED`, chain invalidated |
| Auto ONGOING transition job fails | Retry with backoff, admin alert on final failure |

All errors include `code`, `message`, `correlationId`.

---

## 12. SECURITY THREAT MODEL

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Parameterized queries / ORM |
| XSS | Input validation, output encoding |
| CSRF | Double‑submit cookie pattern |
| Brute force login | Rate limiting + account lockout |
| Session hijacking | Server‑side sessions, httpOnly cookies, session revocation |
| Unauthorized data access | RLS at database level, trusted tenant context, dedicated admin role |
| File upload attack | Type, size, content validation, malware scan if available |
| Privilege escalation | Role guards + RLS; admin bypass only via `app_admin` DB role |
| Audit tampering | Immutable cryptographic chain, WORM replication |
| QR spoofing | Token lookup via secure function; no personal data in token; PDF hash stored |
| Public verification data leak | SECURITY DEFINER function returns only allowed fields |
| Refresh token reuse | Reuse detection and chain invalidation |
| External service failure | Circuit breakers and outbox pattern |

---

## 13. RESILIENCE & FALLBACK

- **Email service unavailable:** Outbox stores event; worker retries with backoff; business operation still succeeds.
- **Storage service unavailable:** Return 503; do not lose uploaded file metadata; retry later.
- **PDF generation failure:** Retry, notify user, keep internship in current state.
- **Database connection pool exhausted:** Wait / fail fast with 503.
- **Redis unavailable:** Fallback to PostgreSQL‑backed queue and in‑memory cache.
- **WORM export failure:** Alert admin; database audit log remains authoritative.
- **Circuit breaker open:** Requests fail fast with 503; half‑open retries after cooldown.

---

## 14. SCREEN FLOW MAP

```
Login
  │
  ├── Student Dashboard
  │     ├── My Applications
  │     │     ├── New Application
  │     │     ├── Application Detail
  │     │     │     ├── Upload Documents (versioned)
  │     │     │     ├── View Status
  │     │     │     └── Daily Log Editor
  │     │     └── Preview Staj Defteri
  │     └── Evaluation Results
  │
  ├── Academic Dashboard
  │     ├── Pending Applications
  │     │     ├── Review Documents (version history)
  │     │     ├── Approve / Reject / Request Revision
  │     │     └── SGK Management
  │     ├── Employer Evaluation
  │     │     ├── Generate Link
  │     │     ├── Manual Entry
  │     │     └── Review Digital Evaluations
  │     ├── Grade Finalisation
  │     └── Generate Final PDF
  │
  ├── Admin Dashboard
  │     ├── Department Management
  │     ├── User Management
  │     ├── Company Management
  │     ├── Calendar & Holiday Management
  │     ├── Document Type Management
  │     ├── System Configuration
  │     ├── Audit Log Viewer
  │     └── Reports
  │
  ├── Employer Evaluation Page (standalone)
  │
  └── Public Verification Page (standalone)
```

---

## 15. CONCLUSION

This SDD provides the complete operational design for IMAS. It resolves all previously open workflow questions, defines how users interact with the system, how documents are reviewed, how QR codes are generated and verified, and how the system responds to errors and security threats. The design aligns with SRS, SAD, DDD, and API Specification.