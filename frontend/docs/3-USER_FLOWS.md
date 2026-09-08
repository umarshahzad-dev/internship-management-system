# 3. User Flows

This document defines the routing hierarchy and role‑based access control (RBAC) for the frontend. It is derived from the backend `RolesGuard` logic and route definitions.

## 1. Public Routes

| Route | Description | Component |
|-------|-------------|-----------|
| `/login` | Split‑screen login form | `LoginPage` |
| `/forgot-password` | Request password reset | `ForgotPasswordPage` |
| `/reset-password` | Reset password with token | `ResetPasswordPage` |
| `/employer/approve/:token` | Employer approves internship via token | `EmployerApprovalPage` |
| `/employer/evaluate/:token` | Employer submits evaluation via token | `EmployerEvaluationPage` |
| `/verify/:internshipId` | Public verification of internship | `PublicVerificationPage` |

## 2. Authenticated Routes

All authenticated routes require a valid session cookie (`imas_session`). The `AuthGuard` component (frontend) will redirect unauthenticated users to `/login`.

### Student

| Route | Description | Backend Permission |
|-------|-------------|--------------------|
| `/dashboard` | Student dashboard | own data only |
| `/internships` | List own internships | `GET /internships` (STUDENT) |
| `/internships/:id` | Internship detail | owner only |
| `/internships/:id/documents` | Upload/list documents | owner only |
| `/internships/:id/staj-defteri` | Generate logbook PDF | owner only |
| `/internships/documents/zorunlu-staj-belgesi` | Generate mandatory letter | own user |
| `/profile` | View/update own profile | self |
| `/system-configs` (public data only) | View public configs | public |

### Academic

| Route | Description | Backend Permission |
|-------|-------------|--------------------|
| `/dashboard` | Academic dashboard | department scoped |
| `/companies` | List/update companies | Admin/Academic |
| `/document-types` | Manage document types | Admin/Academic |
| `/calendars` | View academic calendars | Auth |
| `/holidays` | View holidays | Auth |
| `/internships` | List department internships | Academic scoped |
| `/internships/:id` | Internship detail | department only |
| `/internships/:id/approve` | Commission approval | Academic |
| `/internships/:id/reject` | Reject application | Academic |
| `/internships/:id/request-revision` | Request revision | Academic |
| `/internships/:id/sicil-fisi` | Generate evaluation form | Academic/Admin Staff |
| `/sgk` | List SGK records | Academic/Admin Staff |
| `/internships/:id/transition-to-ongoing` | Start internship | Academic/Admin Staff |
| `/scoring/:internshipId` | Enter academic score | Academic |

### Administrative Staff

| Route | Description | Backend Permission |
|-------|-------------|--------------------|
| `/dashboard` | Staff dashboard | department scoped |
| `/sgk` | List SGK records | Admin Staff/Academic |
| `/internships/:id/sgk` | Create SGK record | Admin Staff/Academic |
| `/sgk/:id/upload` | Upload SGK document | Admin Staff/Academic |
| `/sgk/:id/status` | Update SGK status | Admin Staff/Academic |
| `/internships/:id/finalize` | Finalize internship | Academic/Admin Staff |
| `/internships/:id/sicil-fisi` | Generate evaluation form | Admin Staff/Academic |

### Admin

| Route | Description | Backend Permission |
|-------|-------------|--------------------|
| `/dashboard` | Admin dashboard | all |
| `/users` | Manage users | Admin |
| `/departments` | Manage departments | Admin |
| `/companies` | Manage companies | Admin (can verify) |
| `/document-types` | Manage document types | Admin |
| `/calendars` | Manage calendars | Admin |
| `/holidays` | Manage holidays | Admin |
| `/internships` | View all internships | Admin (requires `X-Department-Id` header) |
| `/reports` | Download CSV reports | Admin |
| `/system-configs` | View/update system configs | Admin |
| `/audit-logs` (future) | View audit logs | Admin |

## 3. Route Guard Matrix

| Role | Public | Student | Academic | Admin Staff | Admin |
|------|--------|---------|----------|-------------|-------|
| Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register (no) | – | – | – | – | – |
| Dashboard | – | ✅ | ✅ | ✅ | ✅ |
| Users | – | ❌ | ❌ | ❌ | ✅ |
| Departments | – | ❌ | ❌ | ❌ | ✅ |
| Companies | – | ❌ | ✅ | ❌ | ✅ |
| Document Types | – | ❌ | ✅ | ❌ | ✅ |
| Calendars | – | ✅ | ✅ | ✅ | ✅ |
| Holidays | – | ✅ | ✅ | ✅ | ✅ |
| Internships (list) | – | ✅ (own) | ✅ (dept) | ✅ (dept) | ✅ (all) |
| Internships (create) | – | ✅ | ❌ | ❌ | ❌ |
| SGK | – | ❌ | ✅ | ✅ | ❌ |
| Reports | – | ❌ | ❌ | ❌ | ✅ |
| System Configs | public only | public only | public only | public only | admin |

## 4. Employer Token Flows

- **Approval flow:** Employer receives link `/employer/approve/:token`. Page calls `POST /public/internship/employer-approve` with token and optional SGK/IBAN. No login required.
- **Evaluation flow:** Employer receives link `/employer/evaluate/:token`. Page calls `GET /employer-evaluation/validate?token=...` to load context, then `POST /employer-evaluation/submit`.