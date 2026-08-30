export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly statusCode: number = 400,
  ) {
    super(message || code);
    this.name = 'DomainException';
  }
}
