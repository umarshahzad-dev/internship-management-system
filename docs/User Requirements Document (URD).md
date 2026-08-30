# PROJECT SPECIFICATION: INTERNSHIP MANAGEMENT & AUTOMATION SYSTEM
# (STAJ YÖNETİM VE OTOMASYON SİSTEMİ TEKNİK ŞARTNAMESİ)

**Security Level: High Security / KVKK Compliant**

---

## 1. PROJECT OBJECTIVE

The objective of this project is to design and develop a web-based platform to manage the complete lifecycle of student internships. The system replaces the traditional physical "Staj Defteri" (Internship Notebook) with a fully digitised process.

The system must ensure data integrity, prevent errors, and allow for legal verification of documents. It must strictly adhere to the University's official visual standards.

---

## 2. SYSTEM ARCHITECTURE REQUIREMENTS

To ensure the system is sustainable and adaptable to future infrastructure changes, the following architectural rules must be followed:

### 2.1 Infrastructure Independence

The software must be designed so that core technologies can be changed with minimal impact on business logic ("Design for Change").

- **Authentication:** The system must currently support Local Login (Email/Password). However, it must be capable of switching to external systems (like LDAP or SSO) in the future via configuration changes only.
- **Database:** The core business/domain logic shall remain independent of the specific database engine. The initial implementation uses PostgreSQL and PostgreSQL Row-Level Security. Future migration to another relational database may require a replacement persistence adapter and database-specific schema/security implementation, but shall not require rewriting the core business rules.
- **Storage:** The system must be able to switch between Local Disk Storage and Cloud Storage (S3) easily via configuration.

### 2.2 Department Isolation (Multi-Tenancy)

The system will serve multiple different Departments (e.g., Computer Engineering, Electrical Engineering) simultaneously.

**Strict Data Security:** Users from one department must never be able to access data from another department. This isolation must be enforced strictly at the database level to prevent data leaks.

**Admin Access:** System-wide Administrators access all departments via a dedicated database role (`app_admin`) that bypasses Row-Level Security; no application-level role bypass is permitted.

---

## 3. REQUIRED SUBSYSTEMS

The project must include the following 13 high‑level functional modules. These modules may be further decomposed into smaller implementation modules during detailed design. Each module must meet the specific requirements listed below:

### 1. User & Role Management Module

The system must manage three internal user roles: Student, Academic (Commission Member), and Administrator. It must also support two external actors: Employer and Public Verifier. The system must enforce strict access control so users can only see data relevant to their own Department. System-wide Administrators use a dedicated database role to access all departments.

### 2. Academic Calendar Module

Administrators must be able to define the official internship term dates (Start/End) and application windows. The system must not allow applications outside these dates.

### 3. Partner Company Database Module

The system must maintain a registry of external companies where students perform internships. It must store company details, tax numbers, and contact information. Students can add new companies via a "find-or-create" mechanism: if the Tax Number (VKN) exists, the existing record is linked; otherwise an unverified company is created.

### 4. Student Application Module

Students must be able to submit internship applications digitally. This includes selecting dates, company details, and uploading necessary prerequisites (e.g., ID copies). Rejected application documents can be resubmitted; each submission creates a new version preserving full audit history.

### 5. Commission Approval Workflow Module

Academics must have an interface to review pending applications. They must be able to Approve, Reject (with a reason), or Request Revision (sending it back to the student).

### 6. Insurance (SGK) Tracking Module

The system must track the Social Security status of every accepted student. It must manage the generation and storage of "Entry/Exit Declarations" (İşe Giriş/Çıkış Bildirgesi).

### 7. Digital Notebook (Daily Log) Editor

Students must have a rich-text editor to record their daily work activities. The editor must support technical formatting but restrict the user from breaking the official document layout.

### 8. Employer Evaluation Interface

The system must provide a secure way for external employers to grade students on attendance and performance. (See Section 4.2 for the detailed Hybrid Workflow).

### 9. Scoring & Assessment Module

The system must automatically calculate the student's final success score based on the Employer's grade and the Academic's review of the notebook. Grading weights and letter scales are snapshotted when the internship enters Evaluation; subsequent config changes do not affect in-progress internships.

### 10. Document Generation Engine

The system must programmatically generate the official "Staj Defteri" as a PDF. This PDF must visually match the University's strict 4-Zone template layout exactly.

### 11. Verification & Security Module

The system must stamp every approved document with a QR Code and a unique ID. This allows third parties to verify the document's validity without logging in.

### 12. Notification System

The system must send automated emails to users when their status changes (e.g., "Application Approved", "Revision Requested").

### 13. Audit & Compliance Log

The system must record every critical action (Login, Grading, Data Change). These logs must be tamper-proof to ensure no one can alter history. Audit logs use a single global cryptographic chain. System-wide events (failed logins, admin actions) have nullable department and entity identifiers.

---

## 4. FUNCTIONAL SPECIFICATIONS

### 4.1 Internship Workflow

The system must follow a strict order of operations. A student cannot skip steps:

1. **Draft:** Student prepares application.
2. **Applied:** Submitted to Commission.
3. **Commission Review:** Academic approves/rejects or requests revision.
4. **Insurance Active:** SGK entry is processed and confirmed.
5. **Internship Ongoing:** Student fills Daily Logs.
6. **Employer Evaluation:** Company grades the student.
7. **Final Grading:** Commission gives final approval.
8. **Completed:** Final PDF generated, record locked.

**Calendar Check:** All dates selected by students must be automatically checked against the Academic Calendar to prevent overlaps with active school terms. Working day calculations merge global (university-wide) and department-specific holidays.

**SGK Requirement:** The system must not allow the internship to transition to "Ongoing" until the SGK status is ACTIVE. Transition from Approved to Ongoing is automated via a scheduled job checking SGK status and start date; includes retry logic and admin alerting on failure.

### 4.2 Employer Evaluation (Hybrid Workflow)

Because not all companies use digital systems, the software must support two methods for grading:

- **Method A (Digital Link):** The system generates a secure, time-limited link sent to the Employer's email. They can grade the student online without creating an account or password. The token is hashed server-side (SHA-256) before storage and validation; the plain token is only visible in the emailed link.
- **Method B (Manual Entry):** If an employer provides a paper form (Sicil Fişi), an Authorized Academic must have a screen to manually enter the grades into the system. The system must record exactly who entered the data manually.

### 4.3 Automated Document Generation

- **Visual Standard:** The final PDF output must look exactly like the official University "Staj Defteri" template (İç Kapak, Kapak, Defter Sayfa, Pratik Sicil Fişi).
- **Smart Pagination:** If a student writes a long daily log that exceeds one page, the system must automatically create new continuation pages (e.g., Page 10, 10a, 10b). It must ensure headers and footers remain correct on all pages.

### 4.4 Verification

- **Locking:** Once an internship is completed and the final PDF is generated, the record must be permanently locked (Read-Only).
- **Public Verification:** The final PDF must include a QR Code. Scanning this code must take the user to a public endpoint (`/verify/{token}`, no `/api/v1` prefix) returning HTML for browsers and JSON for API clients via Content Negotiation.

---

## 5. SECURITY & PERFORMANCE REQUIREMENTS

### 5.1 High Security Standards

- **Encryption:** All communication between client and server must use HTTPS/TLS.
- **Password Policy:** Passwords must be stored using a strong, memory-hard hashing algorithm (Argon2id). Minimum length and complexity rules must be enforced.
- **Account Protection:** Authentication endpoints must be rate-limited to prevent brute-force attacks. Accounts must be temporarily locked after repeated failed login attempts.
- **Password Reset:** The system must provide a secure, email-based password reset flow.
- **Session Security:** User sessions must use secure, httpOnly, SameSite cookies and expire after a configurable inactivity period.
- **Injection Protection:** The system must use parameterised queries (or an ORM) to prevent SQL Injection attacks.
- **Input Validation:** All user inputs must be sanitised and validated against strict schemas to prevent XSS and injection attacks.
- **CSRF Protection:** All state-changing requests must be protected by CSRF tokens or an equivalent mechanism.
- **File Upload Security:** Uploaded files must be validated for type (e.g., PDF, JPG, PNG only), size (maximum limit enforced), and content to prevent malicious uploads. Upload limits enforced as the minimum of the global system setting and the specific document type limit.
- **External Services:** External service calls (Email, Storage) are protected by Circuit Breakers. Notifications use the Transactional Outbox pattern to guarantee delivery.

### 5.2 Tamper-Proof Auditing

- **Logging:** Every critical action (Login, Grading, Approval, Configuration changes, Data modification) must be recorded in a central, append-only log.
- **Integrity:** Audit logs must be cryptographically chained to prevent deletion or modification by any user, including administrators. The chain is global, not per department.

### 5.3 High Performance

- **Load Handling:** The system architecture must be capable of handling peak loads (e.g., 500 concurrent users during final submission weeks) without significant degradation, and should target API response times under 200ms.
- **PDF Generation:** Synchronous generation target is under 2 seconds for a full internship notebook (30 pages). If exceeded, the API returns `202 Accepted` with a Job ID; generation completes asynchronously with user notification.

---

## 6. ASSUMPTIONS & CONSTRAINTS

- **Development Context:** This project is developed as a solo capstone/internship project. This document serves as the single source of truth for design and implementation decisions.
- **Email Service:** For development, a mock SMTP server or free transactional email service will be used. Production deployment will require a university‑provided SMTP relay.
- **PDF Templates:** The official internship notebook templates will be sourced from the publicly available university website. Production deployment may replace them with official branding assets.
- **Deployment:** Development and testing will be performed on a local containerised environment (Docker). The final deliverable will be packaged as container images to simplify future deployment.
- **Authentication Evolution:** The system initially implements Local Email/Password authentication. The design uses an abstracted authentication strategy that can be swapped with LDAP, OBS SSO, or any future identity provider without modifying business logic.

---

## 7. AUTHENTICATION ARCHITECTURE (Clarification)

The system implements three token types:

1. **Server-side Session ID** (httpOnly cookie) for browsers.
2. **Short-lived JWT Access Token** (validated against session) for API clients.
3. **Rotating Refresh Tokens** (hashed storage, reuse detection invalidates chain).

The auth strategy pattern allows swapping the credential validator (Local/LDAP/SSO) without modifying business logic.