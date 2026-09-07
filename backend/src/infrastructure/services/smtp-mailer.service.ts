import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IConfigProvider } from '../../application/ports/config-provider.port';

@Injectable()
export class SmtpMailerService {
  private readonly logger = new Logger(SmtpMailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: IConfigProvider) {}

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const host = await this.config.get<string>('SMTP_HOST', 'mailpit');
      const port = await this.config.get<number>('SMTP_PORT', 1025);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        ignoreTLS: true,
      });
    }
    return this.transporter;
  }

  async sendRaw(to: string, subject: string, body: string): Promise<void> {
    const transporter = await this.getTransporter();
    try {
      await transporter.sendMail({
        from: '"IMAS System" <noreply@imas.edu.tr>',
        to,
        subject,
        html: body,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      throw error;
    }
  }
}
