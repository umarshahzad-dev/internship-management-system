import { Injectable, Logger } from '@nestjs/common';
import {
  IEmailSender,
  EmailMessage,
} from '../../application/ports/email-sender.port';

@Injectable()
export class ConsoleEmailSenderService extends IEmailSender {
  private readonly logger = new Logger(ConsoleEmailSenderService.name);

  async send(message: EmailMessage): Promise<void> {
    this.logger.log(`Sending email to ${message.to}: ${message.subject}`);
    this.logger.debug(message.html || message.text || '');
  }
}
