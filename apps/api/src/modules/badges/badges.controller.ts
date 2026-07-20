import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BadgesService } from './badges.service';

@ApiTags('badges')
@Controller({ path: 'badges', version: '1' })
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'List all badges' })
  findAll() {
    return this.badgesService.findAll();
  }
}
