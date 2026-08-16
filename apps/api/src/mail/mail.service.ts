import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const url = `${env.WEB_PUBLIC_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(
      email,
      'Восстановление пароля Nechto / Nechto password reset',
      `Чтобы задать новый пароль, откройте ссылку: ${url}\n\nSet a new password using this link: ${url}`,
    );
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const url = `${env.WEB_PUBLIC_URL}/verify-email?token=${encodeURIComponent(token)}`;
    await this.send(
      email,
      'Подтверждение email Nechto / Verify your Nechto email',
      `Подтвердите email по ссылке: ${url}\n\nVerify your email using this link: ${url}`,
    );
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    const host = env.SMTP_HOST;
    const user = env.SMTP_USER;
    const password = env.SMTP_PASSWORD;
    const from = env.SMTP_FROM;
    if (!host || !user || !password || !from) {
      if (env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException(
          'Email delivery is not configured',
        );
      }
      this.logger.warn(
        `Email delivery is not configured; skipped "${subject}" to ${to}`,
      );
      return;
    }
    const transport = nodemailer.createTransport({
      host,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user, pass: password },
    });
    await transport.sendMail({ from, to, subject, text });
  }
}
