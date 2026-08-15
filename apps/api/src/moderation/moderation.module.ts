import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModerationController } from './admin-moderation.controller';
import { ModerationService } from './moderation.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ReportsController, AdminModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
