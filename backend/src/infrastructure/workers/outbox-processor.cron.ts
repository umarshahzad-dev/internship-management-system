import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  NotificationOutboxEntity,
  OutboxStatus,
} from '../database/entities/notification-outbox.entity';
import { SmtpMailerService } from '../services/smtp-mailer.service';

@Injectable()
export class OutboxProcessorCron {
  private readonly logger = new Logger(OutboxProcessorCron.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(NotificationOutboxEntity)
    private readonly outboxRepository: Repository<NotificationOutboxEntity>,
    private readonly smtpMailer: SmtpMailerService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Reset stuck PROCESSING records older than 5 minutes
      const stuckThreshold = new Date(Date.now() - 5 * 60 * 1000);
      await this.outboxRepository
        .createQueryBuilder()
        .update(NotificationOutboxEntity)
        .set({ status: OutboxStatus.PENDING })
        .where('status = :status', { status: OutboxStatus.PROCESSING })
        .andWhere('updated_at < :threshold', { threshold: stuckThreshold })
        .execute();

      const pendingEmails = await this.outboxRepository.find({
        where: {
          status: OutboxStatus.PENDING,
          retryCount: LessThan(3),
        },
        take: 50,
        order: { createdAt: 'ASC' },
      });

      for (const email of pendingEmails) {
        email.status = OutboxStatus.PROCESSING;
        await this.outboxRepository.save(email);

        try {
          await this.smtpMailer.sendRaw(
            email.recipientEmail,
            email.subject,
            email.body,
          );
          email.status = OutboxStatus.SENT;
          email.lastError = null;
        } catch (error: any) {
          email.retryCount += 1;
          email.lastError = error.message;
          email.status =
            email.retryCount >= 3 ? OutboxStatus.FAILED : OutboxStatus.PENDING;
        }
        await this.outboxRepository.save(email);
      }
    } catch (error) {
      this.logger.error('Error processing outbox', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
