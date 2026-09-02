import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NodemailerMailService } from './nodemailer-mail.service';

@Module({
  providers: [
    NodemailerMailService,
    {
      provide: MailService,
      useExisting: NodemailerMailService,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
