import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('hike/:hikeId')
  @ApiOperation({ summary: 'Get reviews for a hike' })
  findByHike(
    @Param('hikeId') hikeId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.reviewsService.findByHike(hikeId, Number(page), Number(limit));
  }

  @Post('hike/:hikeId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a review for a hike' })
  create(
    @Request() req: { user: { id: string } },
    @Param('hikeId') hikeId: string,
    @Body() body: { rating: number; content?: string; visitedAt?: string; conditions?: string },
  ) {
    return this.reviewsService.create(req.user.id, hikeId, body);
  }
}
