# 1. API Specification

This document maps the backend API endpoints to frontend service functions, including HTTP method, URL, required authentication, payload interfaces, and response interfaces. It is derived directly from the NestJS controllers and DTOs.

## Base URL

All authenticated and most public API routes are prefixed with `/api/v1`. However, a few public endpoints are excluded from the global prefix and must be called at the root.

| Environment | Base URL                     |
|-------------|------------------------------|
| Development | `http://localhost:3000/api/v1` |
| Public root | `http://localhost:3000`       |

## Authentication Mechanism

- **Browser (frontend)**: Use HTTP‑only cookie `imas_session` set after login. Include `X-CSRF-Token` header for all state‑changing requests (POST/PATCH/DELETE). The token can be obtained from `GET /auth/csrf` after login or from the login response.
- **Non‑browser clients**: Use `Authorization: Bearer <accessToken>` header.

## Axios Request Signatures

We will create a single Axios instance configured with `baseURL` and `withCredentials: true`. Each service function will use this instance.

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});
```

## 1. Authentication

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/auth/login` | POST | Public | `{ email: string; password: string }` | `{ user: UserProfile; sessionId?: string; csrfToken?: string; accessToken?: string; refreshToken?: string }` |
| `/auth/refresh` | POST | Public | `{ refreshToken: string }` | `{ accessToken: string; refreshToken: string }` |
| `/auth/logout` | POST | Auth + CSRF | none | `{ message: string }` |
| `/auth/csrf` | GET | Auth | none | `{ csrfToken: string }` |
| `/auth/password-reset/request` | POST | Public | `{ email: string }` | `{ message: string }` |
| `/auth/password-reset/confirm` | POST | Public | `{ token: string; newPassword: string }` | `{ message: string }` |
| `/auth/me` | GET | Auth | none | `{ id, email, firstName, lastName, role, departmentId, profilePhotoPath }` |

### Interfaces

```ts
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'ADMIN';
    departmentId: string | null;
    profilePhotoPath: string | null;
  };
  sessionId?: string;
  csrfToken?: string;
  accessToken?: string;
  refreshToken?: string;
}
```

---

## 2. User Management

### Roles: Admin only for most

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/users` | GET | Admin | none | `UserProfile[]` |
| `/users` | POST | Admin + CSRF | `CreateUserDto` | `UserProfile` |
| `/users/import` | POST | Admin + CSRF | `FormData` with CSV file | `{ imported: number; errors: { row: number; message: string }[] }` |
| `/users/me/photo` | POST | Student + CSRF | `FormData` with file | `{ profilePhotoPath: string }` |
| `/users/:id` | GET | Admin or self | none | `UserProfile` |
| `/users/:id` | PATCH | Admin + CSRF | `UpdateUserDto` | `UserProfile` |

```ts
interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  departmentId?: string;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  studentNumber?: string | null;
}

type UserRole = 'STUDENT' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'ADMIN';
```

---

## 3. Departments

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/departments` | GET | Admin | none | `Department[]` |
| `/departments` | POST | Admin + CSRF | `{ name: string; facultyName: string }` | `Department` |

```ts
interface Department {
  id: string;
  name: string;
  facultyName: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Document Types

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/document-types` | GET | Admin/Academic/Student | none | `DocumentType[]` |
| `/document-types` | POST | Admin/Academic + CSRF | `CreateDocumentTypeDto` | `DocumentType` |
| `/document-types/:id` | PATCH | Admin/Academic + CSRF | `UpdateDocumentTypeDto` | `DocumentType` |
| `/document-types/:id` | DELETE | Admin + CSRF | none | `{ message: string }` |
| `/document-types/:id/template` | POST | Admin/Academic + CSRF | `FormData` with file | `{ templatePath: string }` |
| `/document-types/:id/template` | GET | Auth | none | `Buffer` (PDF) |

```ts
interface CreateDocumentTypeDto {
  name: string;
  description?: string;
  isRequired?: boolean;
  source: 'SYSTEM_GENERATED' | 'EXTERNAL_UPLOAD';
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

interface DocumentType {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  source: string;
  allowedFileTypes: string[];
  maxFileSize: number;
  templatePath: string | null;
}
```

---

## 5. Companies

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/companies` | GET | Admin/Academic/Student | Query params optional | `Company[]` |
| `/companies` | POST | Admin/Academic + CSRF | `CreateCompanyDto` | `Company` |
| `/companies/:id` | PATCH | Admin/Academic + CSRF | `UpdateCompanyDto` | `Company` |
| `/companies/:id/deactivate` | POST | Admin/Academic + CSRF | none | `{ message: string }` |
| `/companies/:id/verify` | POST | Admin + CSRF | none | `{ message: string }` |
| `/companies/import` | POST | Admin/Academic + CSRF | `FormData` with CSV file | `{ imported: number; errors: ... }` |

```ts
interface Company {
  id: string;
  name: string;
  taxNumber: string;
  sgkNumber: string | null;
  iban: string | null;
  city: string | null;
  industry: string | null;
  address: string | null;
  website: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  isActive: boolean;
}
```

---

## 6. Academic Calendars

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/calendars` | GET | Admin/Academic/Student/Admin Staff | none | `AcademicCalendar[]` |
| `/calendars/next-term` | GET | Auth | none | `AcademicCalendar` |
| `/calendars` | POST | Admin + CSRF | `CreateCalendarDto` | `AcademicCalendar` |
| `/calendars/:id` | PATCH | Admin + CSRF | `UpdateCalendarDto` | `AcademicCalendar` |
| `/calendars/:id` | DELETE | Admin + CSRF | none | `{ message: string }` |

```ts
interface AcademicCalendar {
  id: string;
  departmentId: string;
  termName: string;
  applicationStart: string; // YYYY-MM-DD
  applicationEnd: string;
  internshipStart: string;
  internshipEnd: string;
}
```

---

## 7. Holidays

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/holidays` | GET | Auth | none | `Holiday[]` |
| `/holidays/merged` | GET | Auth | none | `{ holidays: Holiday[] }` |
| `/holidays/calculate-working-days` | POST | Student/Academic/Admin + CSRF | `{ startDate, endDate, includeSaturdays }` | `{ totalDays, holidaysEncountered }` |
| `/holidays` | POST | Admin + CSRF | `CreateHolidayDto` | `Holiday` |
| `/holidays/:id` | PATCH | Admin + CSRF | `UpdateHolidayDto` | `Holiday` |
| `/holidays/:id` | DELETE | Admin + CSRF | none | `{ message: string }` |

```ts
interface Holiday {
  id: string;
  departmentId: string | null;
  holidayDate: string;
  name: string;
}

interface CalculateWorkingDaysRequest {
  startDate: string;
  endDate: string;
  includeSaturdays: boolean;
}
```

---

## 8. Internships

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/internships` | GET | All roles (dept‑scoped) | none | `InternshipListItem[]` |
| `/internships` | POST | Student + CSRF | `CreateDraftInternshipDto` | `Internship` |
| `/internships/:id` | GET | Auth | none | `InternshipDetail` |
| `/internships/:id` | PATCH | Student + CSRF | `UpdateDraftInternshipDto` | `Internship` |
| `/internships/:id/submit` | POST | Student + CSRF | none | `{ message }` |
| `/internships/:id/withdraw` | POST | Student + CSRF | none | `{ message }` |
| `/internships/:id/approve` | POST | Academic + CSRF | `{}` | `{ message }` |
| `/internships/:id/reject` | POST | Academic + CSRF | `{ reason: string }` | `{ message }` |
| `/internships/:id/request-revision` | POST | Academic + CSRF | `{ reason: string }` | `{ message }` |
| `/internships/:id/complete` | POST | Student + CSRF | none | `{ success: true }` |
| `/internships/:id/finalize` | POST | Academic/Admin Staff + CSRF | none | `{ success: true }` |
| `/internships/:id/history` | GET | Auth | none | `InternshipStatusHistory[]` |
| `/internships/:id/application-form` | GET | Student/Academic/Admin Staff/Admin | none | PDF |
| `/internships/:id/staj-defteri` | GET | Student | none | PDF |
| `/internships/:id/sicil-fisi` | GET | Academic/Admin Staff/Admin | none | PDF |
| `/internships/documents/zorunlu-staj-belgesi` | GET | Student | none | PDF |

```ts
interface InternshipListItem {
  id: string;
  departmentId: string;
  studentId: string;
  companyId: string;
  status: string;
  startDate: string;
  endDate: string;
  locked: boolean;
  approvedAt: string | null;
  employerApprovalIp: string | null;
  employerApprovalTimestamp: string | null;
  commissionApprovalUserId: string | null;
  commissionApprovalTimestamp: string | null;
}
```

---

## 9. Application Documents

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/internships/:id/documents` | POST | Student + CSRF | `FormData(file, documentTypeId)` | `{ id, filePath, status, versionNumber }` |
| `/internships/:id/documents` | GET | Auth | none | `ApplicationDocument[]` |
| `/application-documents/:documentId/accept` | POST | Academic + CSRF | none | `{ message }` |
| `/application-documents/:documentId/reject` | POST | Academic + CSRF | `{ reason: string }` | `{ message }` |

```ts
interface ApplicationDocument {
  id: string;
  internshipId: string;
  documentTypeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  versionNumber: number;
  originalFilename: string;
  rejectionReason: string | null;
}
```

---

## 10. Daily Logs

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/internships/:id/daily-logs` | POST | Student + CSRF | `{ logDate: string; content: string }` | `DailyLog` |
| `/internships/:id/daily-logs` | GET | Student/Academic | none | `DailyLog[]` |
| `/daily-logs/:id` | PATCH | Student + CSRF | `{ logDate?; content? }` | `DailyLog` |

```ts
interface DailyLog {
  id: string;
  internshipId: string;
  logDate: string;
  content: string;
}
```

---

## 11. SGK

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/sgk` | GET | Academic/Admin Staff | none | `SgkTracking[]` |
| `/sgk/department` | GET | Academic/Admin Staff | none | `SgkTracking[]` |
| `/internships/:id/sgk` | POST | Academic/Admin Staff + CSRF | none | `SgkTracking` |
| `/sgk/:id/upload` | POST | Academic/Admin Staff + CSRF | `FormData(file)` | `SgkTracking` |
| `/sgk/:id/status` | PATCH | Academic/Admin Staff + CSRF | `{ status: 'SUBMITTED'|'ACTIVE' }` | `SgkTracking` |
| `/sgk/:id/history` | GET | Academic/Admin Staff | none | `SgkStatusHistory[]` |
| `/internships/:id/transition-to-ongoing` | POST | Academic/Admin Staff + CSRF | none | `{ message }` |

```ts
interface SgkTracking {
  id: string;
  internshipId: string;
  status: 'PENDING' | 'SUBMITTED' | 'ACTIVE';
  documentPath: string | null;
}
```

---

## 12. Employer Evaluation

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/internships/:id/employer-evaluation/generate-link` | POST | Academic + CSRF | none | `{ plainToken, expiresAt }` |
| `/internships/:id/employer-evaluation/manual` | POST | Academic + CSRF | `FormData(employerName, grades JSON, comments, scannedSicilFisi file)` | `EmployerEvaluation` |
| `/internships/:id/employer-evaluation` | GET | Student/Academic | none | `EmployerEvaluation` |
| `/employer-evaluation/validate` | GET | Public | `?token=...` | validation result |
| `/employer-evaluation/submit` | POST | Public | `SubmitDigitalEvaluationDto` | `EmployerEvaluation` |

```ts
interface SubmitDigitalEvaluationDto {
  token: string;
  employerName: string;
  grades: Record<string, string>; // letter grades
  comments?: string | null;
}

interface EmployerEvaluation {
  id: string;
  internshipId: string;
  method: 'DIGITAL' | 'MANUAL';
  employerName: string;
  enteredBy: string | null;
  grades: Record<string, { letter: string; score: number }>;
  comments: string | null;
  submittedAt: string;
}
```

---

## 13. Scoring & Reports

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/internships/:id/academic-score` | POST | Academic + CSRF | `{ logQuality, reportQuality }` | `FinalGrade` |
| `/internships/:id/grade` | GET | Student/Academic | none | `FinalGrade` |
| `/reports/internships/csv` | GET | Admin | none | CSV text |

```ts
interface FinalGrade {
  id: string;
  internshipId: string;
  employerScore: number;
  academicScore: number;
  finalScore: number;
  letterGrade: string;
  calculatedAt: string;
}
```

---

## 14. System Configs

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/system-configs/public` | GET | Public | none | `SystemConfig[]` (public only) |
| `/system-configs/admin` | GET | Admin | none | `SystemConfig[]` (all) |
| `/system-configs/:key` | PATCH | Admin + CSRF | `{ value: string }` | `{ success, key, value }` |

```ts
interface SystemConfig {
  key: string;
  value: string;
  description: string;
  isPublic: boolean;
  updatedAt: string;
}
```

---

## 15. Public Endpoints (no API prefix)

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/public/internship/employer-approve` | POST | Public | `{ token, sgkNumber?, iban? }` | `{ success }` |
| `/public/internship/:id/verify` | GET | Public | none | `VerificationResult` |
| `/employer-evaluation/submit` | POST | Public | `SubmitDigitalEvaluationDto` | `EmployerEvaluation` |
| `/employer-evaluation/validate` | GET | Public | `?token=...` | validation result |