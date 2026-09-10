import { UserRole } from '../value-objects/role.vo';

export class Announcement {
  constructor(
    private readonly _id: string,
    private readonly _title: string,
    private readonly _content: string,
    private readonly _targetRoles: UserRole[],
    private readonly _departmentId: string | null,
    private readonly _expiresAt: Date | null,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    if (!_id || !_title.trim() || !_content.trim() || !_targetRoles.length) throw new Error('Announcement fields are required');
  }
  get id() { return this._id; }
  get title() { return this._title; }
  get content() { return this._content; }
  get targetRoles() { return [...this._targetRoles]; }
  get departmentId() { return this._departmentId; }
  get expiresAt() { return this._expiresAt; }
  get isActive() { return this._isActive; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
}
