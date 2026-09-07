import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOutboxEntity } from '../../infrastructure/database/entities/notification-outbox.entity';
import { OutboxEmailSenderService } from '../../infrastructure/services/outbox-email-sender.service';
import { SmtpMailerService } from '../../infrastructure/services/smtp-mailer.service';
import { OutboxProcessorCron } from '../../infrastructure/workers/outbox-processor.cron';
import { IEmailSender } from '../../application/ports/email-sender.port';
import { IConfigProvider } from '../../application/ports/config-provider.port';
import { EnvConfigProvider } from '../../infrastructure/services/env-config-provider.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationOutboxEntity])],
  providers: [
    {
      provide: IEmailSender,
      useClass: OutboxEmailSenderService,
    },
    {
      provide: IConfigProvider,
      useClass: EnvConfigProvider,
    },
    SmtpMailerService,
    OutboxProcessorCron,
  ],
  exports: [IEmailSender],
})
export class NotificationModule {}
