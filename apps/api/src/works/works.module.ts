import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [AuthModule, PrismaModule, StorageModule],
  controllers: [WorksController],
  providers: [WorksService],
})
export class WorksModule {}
