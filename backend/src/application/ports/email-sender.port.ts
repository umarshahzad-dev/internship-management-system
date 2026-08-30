export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailSender {
  send(message: EmailMessage): Promise<void>;
}
