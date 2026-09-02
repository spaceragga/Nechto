export type PasswordResetMail = {
  to: string;
  resetUrl: string;
  locale: 'ru' | 'en';
};

export abstract class MailService {
  abstract sendPasswordReset(message: PasswordResetMail): Promise<void>;
}
