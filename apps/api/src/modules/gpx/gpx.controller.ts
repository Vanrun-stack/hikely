import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GpxService } from './gpx.service';

@ApiTags('gpx')
@Controller({ path: 'gpx', version: '1' })
export class GpxController {
  constructor(private readonly gpxService: GpxService) {}

  @Get(':hikeId')
  @ApiOperation({ summary: 'Get GPX file info for a hike' })
  getGpxFile(@Param('hikeId') hikeId: string) {
    return this.gpxService.getGpxFile(hikeId);
  }
}
