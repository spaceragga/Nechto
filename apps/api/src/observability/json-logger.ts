import type { LoggerService, LogLevel } from '@nestjs/common';
import { env } from '../config/env';

export class JsonLogger implements LoggerService {
  log(message: unknown, context?: string): void {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const record = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'nechto-api',
      release: env.RELEASE_SHA,
      context,
      message: this.toMessage(message),
      ...(trace ? { trace } : {}),
    });
    if (level === 'error') {
      process.stderr.write(`${record}\n`);
    } else {
      process.stdout.write(`${record}\n`);
    }
  }

  private toMessage(message: unknown): string {
    if (message instanceof Error) return message.message;
    if (typeof message === 'string') return message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
