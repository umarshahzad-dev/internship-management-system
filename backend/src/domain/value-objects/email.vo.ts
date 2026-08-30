export class Email {
  private readonly value: string;

  constructor(email: string) {
    const trimmed = email?.trim();
    if (!trimmed) {
      throw new Error('Email cannot be empty');
    }
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!regex.test(trimmed)) {
      throw new Error('Invalid email format');
    }
    this.value = trimmed.toLowerCase();
  }

  toValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return other instanceof Email && other.value === this.value;
  }
}
