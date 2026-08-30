export abstract class ITokenGenerator {
  abstract generateRandomToken(bytes?: number): string;
  abstract generateCsrfToken(): string;
  abstract generateSessionId(): string;
}
