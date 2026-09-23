import { Controller, Get } from '@nestjs/common';
import type { CurationDesk } from '@nechto/api-contract';
import { RequiresCurator } from '../auth/requires-access';

@Controller('curation')
export class CurationController {
  @Get('desk')
  @RequiresCurator()
  desk(): CurationDesk {
    return {
      pairings: [],
      hangings: [],
      issues: [],
      channels: [],
    };
  }
}
