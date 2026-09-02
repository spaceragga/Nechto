import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { MailService, type PasswordResetMail } from './mail.service';

@Injectable()
export class NodemailerMailService extends MailService {
  private readonly transporter: Transporter;

  constructor() {
    super();
    this.transporter =
      env.MAIL_TRANSPORT === 'smtp'
        ? nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            ...(env.SMTP_USER && env.SMTP_PASSWORD
              ? {
                  auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASSWORD,
                  },
                }
              : {}),
          })
        : nodemailer.createTransport({ jsonTransport: true });
  }

  async sendPasswordReset({
    to,
    resetUrl,
    locale,
  }: PasswordResetMail): Promise<void> {
    const russian = locale === 'ru';
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: russian
        ? 'Восстановление пароля Nechto'
        : 'Reset your Nechto password',
      text: russian
        ? `Чтобы задать новый пароль, откройте ссылку: ${resetUrl}\n\nЕсли вы не запрашивали восстановление, проигнорируйте это письмо.`
        : `Open this link to set a new password: ${resetUrl}\n\nIf you did not request a reset, ignore this email.`,
    });
  }
}
