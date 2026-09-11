export class DepartmentConfig {
  constructor(private readonly _id: string, private readonly _departmentId: string, private readonly _key: string, private readonly _value: string, private readonly _createdAt: Date, private readonly _updatedAt: Date) {}
  get id() { return this._id }
  get departmentId() { return this._departmentId }
  get key() { return this._key }
  get value() { return this._value }
  get createdAt() { return this._createdAt }
  get updatedAt() { return this._updatedAt }
}
