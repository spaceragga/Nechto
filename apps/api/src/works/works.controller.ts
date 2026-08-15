import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  reorderWorksSchema,
  updateWorkSchema,
  workFieldsSchema,
  type ReorderWorksDto,
  type UpdateWorkDto,
  type WorkFieldsDto,
} from '@nechto/api-contract';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorksService } from './works.service';

@Controller('works')
@UseGuards(JwtAuthGuard)
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.worksService.listMine(user.id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024, files: 1 },
    }),
  )
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(workFieldsSchema)) fields: WorkFieldsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.worksService.create(user.id, fields, file);
  }

  @Patch('reorder')
  @HttpCode(204)
  async reorder(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(reorderWorksSchema)) dto: ReorderWorksDto,
  ) {
    await this.worksService.reorder(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWorkSchema)) dto: UpdateWorkDto,
  ) {
    return this.worksService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.worksService.remove(user.id, id);
  }
}
