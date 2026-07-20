import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search hikes' })
  search(
    @Query('q') q = '',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchHikes(q, Number(page), Number(limit));
  }
}
