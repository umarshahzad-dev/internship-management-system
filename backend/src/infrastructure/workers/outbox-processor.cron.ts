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
    const rawResult = await this.dataSource.query(
      `WITH claimed AS (SELECT id FROM notification_outbox WHERE status = $1 AND retry_count < 3 ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT $2)
       UPDATE notification_outbox n SET status = $3, updated_at = NOW() FROM claimed WHERE n.id = claimed.id RETURNING n.*`,
      [OutboxStatus.PENDING, limit, OutboxStatus.PROCESSING],
    );
    // TypeORM drivers normally return rows directly; tolerate tuple/driver wrappers too.
    const rows: Record<string, unknown>[] = Array.isArray(rawResult) && Array.isArray(rawResult[0])
      ? rawResult[0] as Record<string, unknown>[]
      : (rawResult?.rows ?? rawResult) as Record<string, unknown>[];
    // Raw SQL returns snake_case columns; normalize them before handing rows to the entity
    // so retry accounting and SMTP recipient fields are never undefined/NaN.
    return rows.map((row: Record<string, unknown>) => {
      const entity = new NotificationOutboxEntity();
      Object.assign(entity, {
        id: String(row.id ?? row.ID ?? ''),
        recipientEmail: String(row.recipient_email ?? row.recipientEmail ?? ''),
        subject: String(row.subject ?? ''),
        body: String(row.body ?? ''),
        status: row.status as OutboxStatus,
        retryCount: Number(row.retry_count ?? row.retryCount ?? 0),
        lastError: row.last_error == null && row.lastError == null ? null : String(row.last_error ?? row.lastError),
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at)),
        updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(String(row.updated_at)),
      });
      return entity;
    });
  }

  private async processEmail(email: NotificationOutboxEntity): Promise<void> {
    if (!email.id || !email.recipientEmail) {
      this.logger.warn(`Skipping malformed outbox record ${email.id || '<unknown>'}`);
      return;
    }
    try {
      await this.smtpMailer.sendRaw(email.recipientEmail, email.subject, email.body);
      email.status = OutboxStatus.SENT;
      email.lastError = null;
    } catch (error: any) {
      email.retryCount += 1;
      email.lastError = error.message;
      email.status = email.retryCount >= 3 ? OutboxStatus.FAILED : OutboxStatus.PENDING;
    }
    await this.outboxRepository.update(email.id, { status: email.status, retryCount: email.retryCount, lastError: email.lastError });
  }
}
