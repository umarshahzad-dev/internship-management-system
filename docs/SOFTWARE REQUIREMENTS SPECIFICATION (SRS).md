# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Project Name:** Internship Management & Automation System (IMAS)

**Security Level:** High Security / KVKK Compliant

---

## 1. INTRODUCTION

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non‑functional requirements for the Internship Management & Automation System (IMAS). It serves as the single source of truth for design, implementation, and testing of this solo capstone/internship project.

### 1.2 Scope

The system is a high‑security web platform designed to digitise the entire internship lifecycle. It replaces the physical “Staj Defteri” with a legally verifiable digital workflow. The system facilitates student applications, employer evaluations, academic approvals, and the generation of legally binding PDF documents.

### 1.3 Definitions & Acronyms

| Term                         | Definition                                                     |
| ---------------------------- | -------------------------------------------------------------- |
| **Tenant**                   | A specific University Department (e.g., Computer Engineering). |
| **RLS (Row‑Level Security)** | A database capability ensuring data isolation per Tenant.      |
| **Staj Defteri**             | The official Internship Notebook document.                     |
| **WORM**                     | Write‑Once‑Read‑Many (Tamper‑proof storage).                   |
| **SGK**                      | Social Security Institution (Sosyal Güvenlik Kurumu).          |
| **VKN**                      | Vergi Kimlik Numarası (Tax Identification Number).             |

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective

IMAS is a standalone Critical Infrastructure application operating under a Zero Trust security model.

- **Internal Trust:** The system assumes application‑level code may be compromised; therefore, data isolation must be enforced by the Database Engine.
- **External Trust:** External actors (Employers) are treated as unauthenticated entities accessing the system via secure, high‑entropy tokens.
- **Public Verification:** The public verification endpoint uses a controlled, read‑only database path that does not rely on tenant context.

### 2.2 User Roles

| Role         | Description                                        | Access Level                    |
| ------------ | -------------------------------------------------- | ------------------------------- |
| **Student**  | Submits applications and daily logs.               | Tenant‑Scoped (Own Data)        |
| **Academic** | Approves/Rejects applications, enters grades.      | Tenant‑Scoped (Department Data) |
| **Admin**    | Manages configurations, calendars, and users.      | System‑Wide / Multi‑Tenant      |
| **Employer** | External entity. Grades students via secure link.  | Token‑Scoped (Single Session)   |
| **Verifier** | Public entity (SGK/Government). Verifies QR codes. | Public (Read‑Only)              |

> **Admin Scope:** System‑wide Admins may not belong to a specific department. Their `department_id` can be NULL in the data model, or they may have a nominal department but explicit system‑wide privileges. This is resolved in the DDD.

### 2.3 Assumptions and Dependencies

- **Development Environment:** Development and testing are performed locally using Docker containers; no university‑provided services are required during building.
- **Email Service:** For development, a mock SMTP server or a free transactional email service sandbox is used. Production will require a university‑provided SMTP relay.
- **PDF Templates:** The official internship notebook templates are sourced from the publicly available university website and used as the basis for PDF generation. Production deployment may replace assets with official branding.
- **Deployment:** The final deliverable is packaged as container images; production infrastructure is outside the project’s scope.
- **External Systems:** No direct integration with the University’s Student Information System (ÖBS) is assumed for the initial release. Data entry (e.g., student lists) may be manual or imported via CSV.

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Authentication & Authorization

- **REQ‑AUTH‑01:** The system shall authenticate users via Local Email/Password.
- **REQ‑AUTH‑01a:** The authentication module shall use an abstracted strategy pattern so that external identity providers (LDAP, OBS SSO) can be integrated in the future **without modifying business logic**.
- **REQ‑AUTH‑01b:** The system shall support two authentication mechanisms:
  - **Browser clients:** Authenticate via an `httpOnly`, `Secure`, `SameSite=Strict` cookie containing a **server‑side session ID**.
  - **Non‑browser clients:** Authenticate via an `Authorization: Bearer <access_token>` header, where the access token is a short‑lived JWT containing the session ID and user ID, and is validated against the server‑side session.
  Both mechanisms shall be validated by the same guard.
- **REQ‑AUTH‑02:** Passwords must be stored using Argon2id, a modern memory‑hard hashing algorithm resistant to GPU attacks.
- **REQ‑AUTH‑03:** Multi‑Tenancy must be enforced at the Database Engine Level. The application must inject the Tenant ID into the session context at the start of every request. **The tenant context must be derived from a trusted source (server‑side session), not directly from user‑supplied input.**
- **REQ‑AUTH‑04:** Authentication endpoints must be rate‑limited to prevent brute‑force attacks. Accounts must be temporarily locked after a configurable number of consecutive failed login attempts.
- **REQ‑AUTH‑05:** The system must provide a secure, email‑based password reset flow. The reset token shall be stored as a hash; the plain token is sent via email and hashed server‑side before comparison.
- **REQ‑AUTH‑06:** Passwords must satisfy a minimum length of 8 characters and require at least one uppercase letter, one lowercase letter, and one digit. This policy must be configurable.
- **REQ‑AUTH‑07:** Every request to a protected resource must be authorised according to the authenticated user’s role and department. Access must be denied unless explicitly permitted.
- **REQ‑AUTH‑08:** The system shall use **server‑side sessions** to manage authentication. Each session must have a unique session ID, belong to a user, and expire after a configurable inactivity period (default 30 minutes). Expired sessions must require full re‑authentication.
- **REQ‑AUTH‑09:** The system shall support logout, which immediately invalidates the current session.
- **REQ‑AUTH‑10:** The system shall support rotating refresh tokens (stored in `refresh_tokens` table) to allow session renewal without requiring password re‑entry. Refresh tokens must be hashed before storage and rotated on each use. **If a refresh token is presented that has already been used (revoked), the entire token chain for that user must be invalidated immediately, forcing re‑authentication.**
- **REQ‑AUTH‑11:** System‑wide administrators must not rely on an application‑set `current_role = 'ADMIN'` to bypass Row‑Level Security. Administrative access shall use a dedicated database role (`app_admin`) or `SECURITY DEFINER` functions with minimal privileges.

### 3.2 Administration Module

- **REQ‑ADM‑01:** Administrators shall be able to configure Academic Calendars (Application Start/End dates) per Department.
- **REQ‑ADM‑02:** Administrators shall be able to manage User Roles and Permissions.
- **REQ‑ADM‑03:** Administrators shall be able to configure the Weighting Coefficients for grading (e.g., Employer 40%, Academic 60%) and the Letter Grade scale.
- **REQ‑ADM‑04:** Administrators shall be able to import student lists via CSV. The system must validate the CSV structure before processing and report invalid records without affecting valid ones. **Import shall perform an upsert by (department_id, student_number)**, updating existing records if present.
- **REQ‑ADM‑05:** Administrators shall be able to manage public holidays and department‑specific holidays. The system shall merge global and department‑specific holidays for working‑day calculations. **The API shall provide an endpoint to retrieve the merged holiday list for a department.**
- **REQ‑ADM‑06:** Administrators shall be able to configure `min_internship_duration_working_days` per department. The default value shall be 30 days, but departments may override it (e.g., Software Engineering = 40 days).
- **REQ‑ADM‑07:** Administrators shall be able to manage **system‑level configuration** (password policy, session timeout, upload limits, employer token lifetime, etc.) through an admin interface. These settings must be stored in a dedicated `system_configs` table, not only in environment variables.

### 3.3 Company Management Module

- **REQ‑COM‑01:** The system shall maintain a central registry of Partner Companies.
- **REQ‑COM‑02:** Administrators and Academics shall be able to Add, Edit, and Deactivate companies.
- **REQ‑COM‑03:** Students shall be able to search for existing companies or enter a new company that is automatically added to the registry with `is_verified = FALSE`. The new company remains available for future students, and an Academic or Admin can later mark it as `is_verified = TRUE`.
- **REQ‑COM‑04:** The system must validate Company Tax Numbers (VKN) using the standard checksum algorithm **at the application layer**, while the database enforces only the format (10 digits).
- **REQ‑COM‑05:** Deactivated companies must remain visible for historical internship records but must not appear as selectable options in new applications.
- **REQ‑COM‑06:** If a student attempts to add a company whose `tax_number` already exists in the registry, the system shall return the existing company record instead of creating a duplicate. This “find‑or‑create” behaviour shall be exposed via the API.

### 3.4 Student Application Module

- **REQ‑APP‑01:** Students shall be able to upload required documents. Allowed file types are PDF, JPG, and PNG; maximum size shall be configurable (default 5 MB). **The effective maximum size is the lower of the global system upload limit and the document type’s `max_file_size`.**
- **REQ‑APP‑02:** The system must validate that selected internship dates are within the configured internship period and that the internship can be completed before the next academic term begins. The “next term” is determined by the next calendar entry for the same department ordered by `internship_start`.
- **REQ‑APP‑03:** The system shall calculate the duration in Working Days, excluding weekends, public holidays, and department‑specific holidays. The calculated working days must meet or exceed the department’s `min_internship_duration_working_days`.
- **REQ‑APP‑04:** The system must allow internship applications only during the configured application period defined in the Academic Calendar.
- **REQ‑APP‑05:** Uploaded files shall be stored outside the web root, using unique, generated filenames to prevent path traversal and naming conflicts.
- **REQ‑APP‑06:** The system shall present a checklist of required document types for the student’s department. A student must upload at least one file for each required document type before the application can be submitted.
- **REQ‑APP‑07:** Students shall be able to view the status of each uploaded document. If a document is rejected, the student may upload a corrected version; the status resets to `PENDING` and the previous rejection reason is retained for audit. **Resubmissions shall create a new version of the document record, preserving full history.**
- **REQ‑APP‑08:** The system shall allow automatic transition of internships from `APPROVED` to `ONGOING` when SGK status becomes `ACTIVE` and the internship start date has arrived. This transition shall be performed by a scheduled job or equivalent mechanism, not only by manual action.

### 3.5 SGK (Insurance) Integration Module

- **REQ‑SGK‑01:** The system shall list students eligible for insurance entry (Status: Approved).
- **REQ‑SGK‑02:** Authorized Academics (Commission Members) shall be able to upload “Statement of Employment” (İşe Giriş Bildirgesi) files for each student.
- **REQ‑SGK‑03:** The system shall track the SGK status (Pending -> Submitted -> Active).
- **REQ‑SGK‑04:** The internship state **must not** transition to “Ongoing” until the SGK status is ACTIVE.
- **REQ‑SGK‑05:** The system shall maintain a history of SGK status changes with actor and timestamp.

### 3.6 Hybrid Employer Evaluation

- **REQ‑EMP‑01 (Method A – Digital):** The system shall generate a secure, time‑limited evaluation link for employers. The link must be valid for a maximum of 7 days or until used (single‑use). The expiry must be enforced at both application and database levels (`expires_at <= created_at + 7 days`).
- **REQ‑EMP‑02:** The system SHALL NOT store the plain‑text token. It must store only a Cryptographic Hash of the token. **The client sends the plain token; the server hashes it before database lookup.**
- **REQ‑EMP‑03 (Method B – Manual):** Authorized Academics must have an interface to manually transcribe grades from physical forms. The system shall log the Transcriber’s ID and timestamp, and shall allow uploading an optional scanned copy of the paper Sicil Fişi.
- **REQ‑EMP‑04:** The employer evaluation form shall use the official 7 criteria from the University’s “Pratik Sicil Fişi”:
  1. Devam ve Disiplin (Attendance & Discipline)
  2. Çalışma ve Gayret (Work & Effort)
  3. İşi Vaktinde ve Tam Yapma (Timeliness & Completeness)
  4. Tavır ve Davranış (Attitude & Conduct)
  5. Takım Çalışması ve İletişim (Teamwork & Communication)
  6. Etik ve Sorumluluk Bilinci (Ethics & Responsibility)
  7. Kendini Geliştirme ve Öğrenmeye Açıklık (Self‑Improvement & Openness to Learning)
- **REQ‑EMP‑05:** Each criterion must be graded on the A, B, C, D, E scale. The system shall map letters to numeric values (A=5, B=4, C=3, D=2, E=1) for score calculation. Both the letter and numeric value shall be stored.
- **REQ‑EMP‑06:** The numeric employer score used in final grade calculation shall be the average of the 7 numeric sub‑scores, scaled to a 0‑100 range, unless the department‑specific weighting configuration overrides this.
- **REQ‑EMP‑07:** The system shall store the employer evaluation token lookup in a way that does not require prior tenant context. A `SECURITY DEFINER` function or dedicated read‑only database path shall be used.

### 3.7 Digital Notebook (Daily Log)

- **REQ‑LOG‑01:** The system shall provide a Rich Text Editor restricted to basic formatting (Bold, Italic, Lists) to ensure PDF compatibility.
- **REQ‑LOG‑02:** Daily Log entries must be editable only when the internship is in the “Ongoing” state, as defined in Business Rule BR‑02.

### 3.8 Notification Module

- **REQ‑NOT‑01:** The system shall send automated emails for critical events: Application Submission, Approval/Rejection, Revision Requested, Employer Link Generated, Final Report Ready, Document Rejected, SGK Active, Final Grade Ready, PDF Generated.
- **REQ‑NOT‑02:** Notifications must be processed asynchronously to prevent blocking the user interface.
- **REQ‑NOT‑03:** Failed notification deliveries shall be retried according to a configurable retry policy (e.g., exponential backoff, max 3 attempts). The business operation that triggered the notification must succeed even if the notification temporarily fails.
- **REQ‑NOT‑04:** The system shall persist in‑app notifications for each user in a dedicated `notifications` table. Each notification must have `read_at` and `created_at` fields. **The `outbox_events` table shall be used to track email delivery status with columns for sent_at and error.**

### 3.9 Document Generation Engine

- **REQ‑DOC‑01:** The system shall generate a PDF document that exactly matches the official University Internship Notebook template structure (İç Kapak, Kapak, Defter Sayfa, Pratik Sicil Fişi).
- **REQ‑DOC‑02:** The system must support Dynamic Pagination, automatically creating continuation pages (e.g., “Page 10a”) when text content exceeds zone limits.
- **REQ‑DOC‑03:** All generated PDFs must include a QR Code pointing to the public verification endpoint, a unique Verification UUID, and a generation timestamp.
- **REQ‑DOC‑04:** Once generated and archived, PDFs must be immutable (Read‑Only). The system shall store a cryptographic hash (SHA‑256) of the final PDF to allow integrity verification.
- **REQ‑DOC‑05:** The final PDF shall only be generated when the internship is in `GRADED` state. After successful generation and archival, the internship transitions to `COMPLETED`.

### 3.10 Verification Module

- **REQ‑VER‑01:** The system shall expose a public verification endpoint at `GET /verify/{verification_token}` (no `/api/v1` prefix). **The endpoint shall support content negotiation: return HTML (human-readable page) for `Accept: text/html` and JSON for `Accept: application/json`.**
- **REQ‑VER‑02:** This endpoint shall return the Student Name, Internship Status, and Approval Date only if the UUID is valid. The Approval Date is stored explicitly in `internships.approved_at`.
- **REQ‑VER‑03:** The verification endpoint shall be rate‑limited to prevent abuse.
- **REQ‑VER‑04:** Invalid or expired verification identifiers shall return a generic “Document not found or invalid” response without exposing internal information.
- **REQ‑VER‑05:** Public verification shall use a controlled database access path (e.g., `SECURITY DEFINER` function) that does not require an authenticated tenant context.

### 3.11 Audit & Compliance Log

- **REQ‑AUD‑01:** The system must record all critical state changes: Login/Logout (successful and failed), Password Reset, Application Submission, Approval/Rejection, Grade Entry, Configuration Changes, Document Generation, and Data Modification.
- **REQ‑AUD‑02:** The Audit Log must use Cryptographic Chaining. Each log entry must contain a hash of the previous entry, creating an immutable, tamper‑evident chain. **The chain shall be global (single chain for all records), not per department.**
- **REQ‑AUD‑03:** Audit records must be append‑only; no user (including administrators) may modify or delete existing log entries.
- **REQ‑AUD‑04:** All audit timestamps must be stored in UTC.
- **REQ‑AUD‑05:** Audit logs must support events that are not scoped to a specific department (e.g., global admin actions, failed login for nonexistent user). `department_id` may be NULL, and `entity_id` may be NULL for such events.

### 3.12 Internship Lifecycle (State Machine)

- **REQ‑WF‑01:** The system shall enforce the following states:
  - **Draft:** Student is editing.
  - **Applied:** Submitted to commission.
  - **Revision:** Commission requested changes.
  - **Approved:** Commission accepted (requires all required documents `ACCEPTED`).
  - **Rejected:** Commission permanently rejected the application.
  - **Ongoing:** Internship active (requires SGK ACTIVE).
  - **Evaluation:** Internship finished, waiting for grades.
  - **Graded:** Employer and academic scores finalized, final grade calculated; PDF generation pending.
  - **Completed:** Final PDF generated, archived, record locked. (No separate `ARCHIVED` state.)
  - **Withdrawn:** Student withdrew the application before approval; terminal state.
- **REQ‑WF‑02:** The system must prevent any modification to Application Data once the status reaches Approved. Rejected and Withdrawn applications are closed and cannot be edited.
- **REQ‑WF‑03:** Any attempt to perform an invalid state transition (e.g., skipping a stage) must be rejected by the system.
- **REQ‑WF‑04:** The system shall record a timestamp (`approved_at`) when an application is approved. This timestamp is used by the public verification endpoint.
- **REQ‑WF‑05:** The system shall maintain an **internship status history** table recording every transition with from/to states, reason, actor, and timestamp.
- **REQ‑WF‑06:** The transition from `APPROVED` to `ONGOING` shall be executed by a scheduled system job or automatic trigger when both conditions are met: SGK ACTIVE and current date ≥ start_date. The system may also allow manual transition by Academic if needed. **If the scheduled job fails to transition eligible internships, it must retry with exponential backoff (max 3 attempts) and raise an administrative alert/notification on final failure.**

### 3.13 Scoring & Assessment Module

- **REQ‑SCR‑01:** The system shall calculate the Final Grade using the formula: (EmployerScore * W1) + (AcademicScore * W2), where weights are defined per department.
- **REQ‑SCR‑02:** The system shall determine the Letter Grade (AA, BA, BB, etc.) based on the calculated Final Grade and the configured grading scale. **The scale shall be stored in `department_configs.letter_grade_scale` and is configurable per department. No hardcoded letter grade list shall exist in the database.**
- **REQ‑SCR‑03:** The academic score shall be based on defined academic criteria. These criteria must be configurable per department. Default criteria are:
  - Log Quality (weight 70%)
  - Report Quality (weight 30%)
  These weights are configurable and stored in `department_configs`.
- **REQ‑SCR‑04:** When an internship transitions to `EVALUATION`, the current grading weights, letter grade scale, and academic criteria shall be snapshotted into `internships.grading_data`. The final grade calculation shall use this snapshot, not the live department configuration.

### 3.14 Commission Document Review Module

- **REQ‑REV‑01:** Academics shall be able to view all uploaded documents for a given application.
- **REQ‑REV‑02:** Academics shall be able to accept or reject each uploaded document individually, and when rejecting they must provide a reason.
- **REQ‑REV‑03:** The overall application cannot transition to `APPROVED` until all required document types have at least one document with status `ACCEPTED`.
- **REQ‑REV‑04:** When a document is rejected, the system shall notify the student with the rejection reason.
- **REQ‑REV‑05:** The student may upload a corrected version of a rejected document; the document status returns to `PENDING`, and the previous rejection reason is retained for audit.
- **REQ‑REV‑06:** Resubmissions shall create **new document versions** (new rows) rather than overwriting the original file record. The system must retain full history of all uploads. The API shall return the `versionNumber` of the newly created document.

### 3.15 Document Type & Template Management

- **REQ‑DT‑01:** Administrators **and Academics** shall be able to define document types for their own department. Each document type shall have: name, description, required flag, allowed file types, maximum file size, and an optional blank template file.
- **REQ‑DT‑02:** Administrators and Academics shall be able to upload blank templates for each document type.
- **REQ‑DT‑03:** Students shall be able to download blank templates for their department’s required document types.
- **REQ‑DT‑04:** Document types can be pre‑seeded with common university forms (e.g., Zorunlu Staj Belgesi, Staj Başvuru Formu, etc.) and remain fully configurable.

---

## 4. NON‑FUNCTIONAL REQUIREMENTS

### 4.1 Performance

- **NFR‑PER‑01:** The system shall support 500 concurrent users with an API response time of < 200ms for typical operations.
- **NFR‑PER‑02:** PDF generation **API request initiation** shall return in < 200ms. When synchronous, the complete PDF generation must complete within 2 seconds for a standard 30‑page notebook. If generation exceeds 2 seconds, the system shall switch to asynchronous mode, returning `202 Accepted` with a job identifier, and notify the user upon completion.

### 4.2 Security

- **NFR‑SEC‑01:** The system must adhere to OWASP ASVS Level 2 standards.
- **NFR‑SEC‑02:** All database interactions must use Parameterized Queries or an ORM to prevent SQL Injection.
- **NFR‑SEC‑03:** All external links (Employer Tokens) must be one‑time use and time‑bound (Max 7 days).
- **NFR‑SEC‑04:** All communication must be encrypted using TLS 1.2 or higher.
- **NFR‑SEC‑05:** The application must implement CSRF protection for all authenticated state‑changing requests.
- **NFR‑SEC‑06:** File uploads must be validated for allowed types and size, and scanned for malware if infrastructure permits.
- **NFR‑SEC‑07:** Public verification and employer token validation must not bypass Row‑Level Security using user‑controlled parameters. They must use dedicated trusted database functions or roles with minimal privileges.
- **NFR‑SEC‑08:** Administrative access must not rely on application‑set `app.current_role = 'ADMIN'`. A dedicated DB role (`app_admin`) or `SECURITY DEFINER` functions shall be used.

### 4.3 Reliability

- **NFR‑REL‑01:** The system must implement a Circuit Breaker pattern for external services (Email, Storage).
- **NFR‑REL‑02:** Critical data (Audit Logs) must be replicated to WORM storage. In production, this is achieved using S3 Object Lock or equivalent immutable storage.
- **NFR‑REL‑03:** Regular database backups must be performed and documented; restoration procedures must be periodically tested.
- **NFR‑REL‑04:** Asynchronous operations (emails, PDF generation if async) shall use an Outbox pattern or a persistent job queue to guarantee delivery/reliability.

### 4.4 Maintainability & Compatibility

- **NFR‑MAI‑01:** The frontend must be a responsive web application supporting modern versions of Chrome, Firefox, Edge, and Safari.
- **NFR‑MAI‑02:** All business logic must be covered by unit tests (minimum 80% coverage for core domain).
- **NFR‑MAI‑03:** The system must support Turkish language for all user‑facing text; the design should allow addition of other languages without structural changes.
- **NFR‑MAI‑04:** All configurable values (password policy, session timeout, grading weights, upload limits, token lifetime, etc.) must be changeable without source code modification.

### 4.5 Data Retention

- **NFR‑RET‑01:** Internship records shall be retained online for 5 years after completion, then archived.
- **NFR‑RET‑02:** Audit logs shall be retained permanently.
- **NFR‑RET‑03:** Final verification identifiers do not expire while the official record is retained. Invalid/revoked identifiers return the generic not‑found response.

---

## 5. BUSINESS RULES

- **BR‑01:** A student cannot have two active internships at the same time.
- **BR‑02:** A student may edit Daily Log entries only while the internship is in the “Ongoing” state. Once the student submits the final notebook (internship transitions to “EVALUATION”), all daily logs become read‑only.
- **BR‑03:** An Academic cannot approve an application for a student belonging to a different Department (enforced via RLS).
- **BR‑04:** The internship shall transition to `COMPLETED` only after the final PDF has been successfully generated and archived.
- **BR‑05:** Business records (users, internships, companies) must not be permanently deleted through normal application operations. Records must be soft‑deleted or marked inactive unless explicitly permitted by data retention policies. Drafts may be discarded, but the record is retained and marked `WITHDRAWN`.
- **BR‑06:** An application cannot transition from `APPLIED` to `APPROVED` unless all required document types have at least one uploaded document with status `ACCEPTED`.

---

## 6. EXTERNAL INTERFACE REQUIREMENTS

### 6.1 User Interfaces

- **REQ‑UI‑01:** The system shall provide a responsive web interface accessible via modern web browsers.

### 6.2 API Interfaces

- **REQ‑API‑01:** The backend shall expose a documented RESTful API for client‑server communication.
- **REQ‑API‑02:** All data exchange shall use JSON format.
- **REQ‑API‑03:** All API endpoints must return standardised error responses containing an error code, a human‑readable message, and a correlation identifier for debugging.
- **REQ‑API‑04:** Public verification and employer evaluation endpoints shall be outside `/api/v1` and shall not require authentication.

---

## 7. HIGH‑LEVEL DATA REQUIREMENTS

- **Identifiers:** All primary keys must use Time‑Ordered Unique Identifiers (UUIDv7) to prevent enumeration.
- **Data Retention:** Internship data must be retained online for 5 years, then archived.
- **Tenant Isolation:** All transactional tables must be isolated by department using Row‑Level Security. System‑wide Admins may have a `NULL` department.
- **Workflow History:** All state transitions must be recorded in a history table with actor and timestamp.