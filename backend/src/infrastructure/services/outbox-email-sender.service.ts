import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IEmailSender,
  EmailMessage,
} from '../../application/ports/email-sender.port';
import {
  NotificationOutboxEntity,
  OutboxStatus,
} from '../database/entities/notification-outbox.entity';

@Injectable()
export class OutboxEmailSenderService implements IEmailSender {
  constructor(
    @InjectRepository(NotificationOutboxEntity)
    private readonly outboxRepository: Repository<NotificationOutboxEntity>,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const outboxEntry = this.outboxRepository.create({
      recipientEmail: message.to,
      subject: message.subject,
      body: message.html || message.text || '',
      status: OutboxStatus.PENDING,
      retryCount: 0,
      lastError: null,
    });

    await this.outboxRepository.save(outboxEntry);
  }
}
