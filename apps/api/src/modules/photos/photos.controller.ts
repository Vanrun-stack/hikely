import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PhotosService } from './photos.service';

@ApiTags('photos')
@Controller({ path: 'photos', version: '1' })
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get('hike/:hikeId')
  @ApiOperation({ summary: 'Get photos for a hike' })
  findByHike(@Param('hikeId') hikeId: string) {
    return this.photosService.findByHike(hikeId);
  }
}
