export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export abstract class IEmailSender {
  abstract send(message: EmailMessage): Promise<void>;
}
