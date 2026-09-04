export enum UserRole {
  STUDENT = 'STUDENT',
  ACADEMIC = 'ACADEMIC',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  ADMIN = 'ADMIN',
}

export class Role {
  private readonly value: UserRole;

  constructor(role: UserRole) {
    this.value = role;
  }

  getValue(): UserRole {
    return this.value;
  }

  equals(other: Role): boolean {
    return other instanceof Role && other.value === this.value;
  }

  isStudent(): boolean {
    return this.value === UserRole.STUDENT;
  }

  isAcademic(): boolean {
    return this.value === UserRole.ACADEMIC;
  }

  isAdministrative(): boolean {
    return this.value === UserRole.ADMINISTRATIVE;
  }

  isAdmin(): boolean {
    return this.value === UserRole.ADMIN;
  }
}
