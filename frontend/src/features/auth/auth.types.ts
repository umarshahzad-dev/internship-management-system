export type UserRole = 'STUDENT' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'ADMIN'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  departmentId: string | null
  profilePhotoPath: string | null
}

export interface LoginRequest { email: string; password: string }

export interface LoginResponse { user: UserProfile; csrfToken?: string }
