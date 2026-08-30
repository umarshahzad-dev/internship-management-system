export interface ITokenGenerator {
  generateRandomToken(bytes?: number): string;
  generateCsrfToken(): string;
  generateSessionId(): string;
}
