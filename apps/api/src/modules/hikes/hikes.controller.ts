import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { HikesService } from './hikes.service';
import { CreateHikeDto } from './dto/create-hike.dto';
import { UpdateHikeDto } from './dto/update-hike.dto';
import { HikeFiltersDto } from './dto/hike-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('hikes')
@Controller('hikes')
export class HikesController {
  constructor(private readonly hikesService: HikesService) {}

  // ─── Public: List / Search ───────────────────────────────────────
  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'List and filter hikes' })
  findAll(@Query() filters: HikeFiltersDto, @GetUser('id') _userId?: string) {
    return this.hikesService.findAll(filters);
  }

  // ─── Public: Single Hike ─────────────────────────────────────────
  @Get(':slug')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get hike details by slug' })
  @ApiParam({ name: 'slug', description: 'Hike URL slug' })
  findOne(@Param('slug') slug: string, @GetUser('id') userId?: string) {
    return this.hikesService.findBySlug(slug, userId);
  }

  // ─── Auth: Create Hike ───────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hike' })
  create(@Body() dto: CreateHikeDto, @GetUser('id') userId: string) {
    return this.hikesService.create(dto, userId);
  }

  // ─── Auth: Update Hike ───────────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a hike (author or admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHikeDto,
    @GetUser() user: any,
  ) {
    return this.hikesService.update(id, dto, user);
  }

  // ─── Auth: Delete Hike (soft) ─────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a hike (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hikesService.remove(id);
  }

  // ─── Auth: Publish Hike ──────────────────────────────────────────
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('moderator', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a hike (moderator+)' })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.hikesService.publish(id);
  }

  // ─── Auth: Increment view count ──────────────────────────────────
  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track hike view (fire-and-forget)' })
  trackView(@Param('id', ParseUUIDPipe) id: string) {
    return this.hikesService.incrementViewCount(id);
  }

  // ─── Auth: Download GPX ─────────────────────────────────────────
  @Get(':id/gpx/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get GPX download URL (authenticated only)' })
  downloadGpx(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    return this.hikesService.getGpxDownloadUrl(id, userId);
  }

  // ─── Nearby Hikes ────────────────────────────────────────────────
  @Get(':id/nearby')
  @ApiOperation({ summary: 'Get hikes near this one' })
  nearby(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('radius') radius = 50,
    @Query('limit') limit = 6,
  ) {
    return this.hikesService.findNearby(id, +radius, +limit);
  }
}
