import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

@Injectable()
export class MailService {
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
    if (
      !env.SMTP_HOST ||
      !env.SMTP_USER ||
      !env.SMTP_PASSWORD ||
      !env.SMTP_FROM
    ) {
      throw new ServiceUnavailableException('Email delivery is not configured');
    }
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
    await transport.sendMail({ from: env.SMTP_FROM, to, subject, text });
  }
}
