export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one digit');
    }
    this.value = password;
  }

  toValue(): string {
    return this.value;
  }
}
