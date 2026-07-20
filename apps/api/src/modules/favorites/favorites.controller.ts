import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'favorites', version: '1' })
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my favorites' })
  findMine(@Request() req: { user: { id: string } }) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Post(':hikeId/toggle')
  @ApiOperation({ summary: 'Toggle favorite' })
  toggle(@Request() req: { user: { id: string } }, @Param('hikeId') hikeId: string) {
    return this.favoritesService.toggle(req.user.id, hikeId);
  }
}
