import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
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

      const pendingEmails = await this.claimPending(50);
      // Bounded concurrency keeps SMTP latency from serially blocking the worker.
      for (let offset = 0; offset < pendingEmails.length; offset += 10) {
        await Promise.all(pendingEmails.slice(offset, offset + 10).map((email) => this.processEmail(email)));
      }
    } catch (error) {
      this.logger.error('Error processing outbox', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async claimPending(limit: number): Promise<NotificationOutboxEntity[]> {
    const rows = await this.dataSource.query(
      `WITH claimed AS (SELECT id FROM notification_outbox WHERE status = $1 AND retry_count < 3 ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT $2)
       UPDATE notification_outbox n SET status = $3, updated_at = NOW() FROM claimed WHERE n.id = claimed.id RETURNING n.*`,
      [OutboxStatus.PENDING, limit, OutboxStatus.PROCESSING],
    );
    return rows.map((row: Record<string, unknown>) => this.outboxRepository.create(row as unknown as NotificationOutboxEntity));
  }

  private async processEmail(email: NotificationOutboxEntity): Promise<void> {
    try {
      await this.smtpMailer.sendRaw(email.recipientEmail, email.subject, email.body);
      email.status = OutboxStatus.SENT;
      email.lastError = null;
    } catch (error: any) {
      email.retryCount += 1;
      email.lastError = error.message;
      email.status = email.retryCount >= 3 ? OutboxStatus.FAILED : OutboxStatus.PENDING;
    }
    await this.outboxRepository.save(email);
  }
}
