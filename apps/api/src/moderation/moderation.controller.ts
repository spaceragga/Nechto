import { Controller, Get } from '@nestjs/common';
import type { ModerationDesk } from '@nechto/api-contract';
import { RequiresModerator } from '../auth/requires-access';

@Controller('moderation')
export class ModerationController {
  @Get('desk')
  @RequiresModerator()
  desk(): ModerationDesk {
    return {
      reports: [],
      hiddenWorks: [],
    };
  }
}
