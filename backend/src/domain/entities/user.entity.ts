import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';

export class User {
  private readonly _id: string;
  private readonly _departmentId: string | null;
  private readonly _email: Email;
  private readonly _passwordHash: string;
  private readonly _role: Role;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _studentNumber: string | null;
  private _isActive: boolean;
  private _lastLogin: Date | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    departmentId: string | null,
    email: Email,
    passwordHash: string,
    role: Role,
    firstName: string,
    lastName: string,
    studentNumber: string | null,
    isActive: boolean,
    lastLogin: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('User id is required');
    if (!email) throw new Error('Email is required');
    if (!passwordHash) throw new Error('Password hash is required');
    if (!role) throw new Error('Role is required');
    if (!firstName || firstName.trim().length === 0)
      throw new Error('First name is required');
    if (!lastName || lastName.trim().length === 0)
      throw new Error('Last name is required');

    // Additional validation: student must have departmentId and studentNumber
    if (role.isStudent()) {
      if (!departmentId) throw new Error('Student must have a department');
      if (!studentNumber) throw new Error('Student must have a student number');
    } else {
      if (studentNumber)
        throw new Error('Only students can have a student number');
    }

    this._id = id;
    this._departmentId = departmentId;
    this._email = email;
    this._passwordHash = passwordHash;
    this._role = role;
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
    this._studentNumber = studentNumber;
    this._isActive = isActive;
    this._lastLogin = lastLogin;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get departmentId(): string | null {
    return this._departmentId;
  }
  get email(): Email {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get role(): Role {
    return this._role;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get studentNumber(): string | null {
    return this._studentNumber;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get lastLogin(): Date | null {
    return this._lastLogin;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateLastLogin(date: Date): void {
    this._lastLogin = date;
  }

  deactivate(): void {
    this._isActive = false;
  }

  activate(): void {
    this._isActive = true;
  }
}
