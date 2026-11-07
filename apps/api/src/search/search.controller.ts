import { Controller, Get, Query } from '@nestjs/common';
import { searchQuerySchema, type SearchQuery } from '@nechto/api-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  search(@Query(new ZodValidationPipe(searchQuerySchema)) query: SearchQuery) {
    return this.searchService.search(query);
  }
}
