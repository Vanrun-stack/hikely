import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHikeDto } from './dto/create-hike.dto';
import { UpdateHikeDto } from './dto/update-hike.dto';
import { HikeFiltersDto } from './dto/hike-filters.dto';
import { Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slugify = require('slugify') as (str: string, opts?: object) => string;

@Injectable()
export class HikesService {
  constructor(private prisma: PrismaService) {}

  // ─── List / Filter ───────────────────────────────────────────────
  async findAll(filters: HikeFiltersDto) {
    const {
      page = 1, limit = 12, search, regionId, difficulty,
      practiceType, minDistance, maxDistance, minElevation,
      maxElevation, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.HikeWhereInput = {
      status: 'published',
      deletedAt: null,
      ...(regionId && { regionId }),
      ...(difficulty && { difficulty: difficulty as any }),
      ...(practiceType && { practiceType: practiceType as any }),
      ...(minDistance && { distanceKm: { gte: minDistance } }),
      ...(maxDistance && { distanceKm: { lte: maxDistance } }),
      ...(minElevation && { elevationGainM: { gte: minElevation } }),
      ...(maxElevation && { elevationGainM: { lte: maxElevation } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.HikeOrderByWithRelationInput = {};
    if (sortBy === 'rating') orderBy.avgRating = sortOrder as any;
    else if (sortBy === 'distance') orderBy.distanceKm = sortOrder as any;
    else if (sortBy === 'popular') orderBy.viewCount = sortOrder as any;
    else orderBy.createdAt = sortOrder as any;

    const [hikes, total] = await Promise.all([
      this.prisma.hike.findMany({
        where,
        orderBy,
        skip,
        take: +limit,
        include: {
          region: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { photos: true, reviews: true, favorites: true } },
        },
      }),
      this.prisma.hike.count({ where }),
    ]);

    return {
      data: hikes,
      meta: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Find by Slug ────────────────────────────────────────────────
  async findBySlug(slug: string, userId?: string) {
    const hike = await this.prisma.hike.findUnique({
      where: { slug },
      include: {
        region:  { select: { id: true, name: true, slug: true, country: true } },
        author:  { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true } },
        tags:    { include: { tag: true } },
        photos:  {
          where: { deletedAt: null },
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
          take: 20,
          select: { id: true, storageKey: true, thumbnailKey: true, caption: true, isFeatured: true },
        },
        reviews: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
        gpxFile: {
          select: {
            id: true,
            elevationProfile: true,
            // Only return full GPX data if user is authenticated
            ...(userId ? { storageKey: true, waypoints: true } : {}),
          },
        },
      },
    });

    if (!hike || hike.deletedAt) throw new NotFoundException('Hike not found');
    if (hike.status !== 'published' && hike.authorId !== userId) {
      throw new NotFoundException('Hike not found');
    }

    // Track view asynchronously
    this.incrementViewCount(hike.id).catch(() => {});

    // Mask GPX for non-authenticated users
    if (!userId && hike.gpxFile) {
      (hike.gpxFile as any).isBlurred = true;
      (hike.gpxFile as any).storageKey = undefined;
    }

    return hike;
  }

  // ─── Create ──────────────────────────────────────────────────────
  async create(dto: CreateHikeDto, userId: string) {
    const slug = await this.generateUniqueSlug(dto.name);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tagIds, bestMonths, ...hikeData } = dto;

    return this.prisma.hike.create({
      data: {
        authorId:      userId,
        regionId:      hikeData.regionId,
        name:          hikeData.name,
        slug,
        description:   hikeData.description,
        difficulty:    hikeData.difficulty as any,
        hikeType:      hikeData.hikeType as any,
        terrainType:   hikeData.terrainType as any,
        practiceType:  hikeData.practiceType as any,
        distanceKm:    hikeData.distanceKm,
        elevationGainM: hikeData.elevationGainM,
        elevationLossM: hikeData.elevationLossM,
        durationMin:   hikeData.durationMin,
        metaTitle:     dto.metaTitle ?? dto.name.slice(0, 70),
        metaDescription: hikeData.metaDescription,
        ...(dto.tagIds?.length && {
          tags: { create: dto.tagIds.map(tagId => ({ tagId })) },
        }),
      },
      include: {
        region: true,
        author: { select: { id: true, username: true, displayName: true } },
        tags:   { include: { tag: true } },
      },
    });
  }

  // ─── Update ──────────────────────────────────────────────────────
  async update(id: string, dto: UpdateHikeDto, user: any) {
    const hike = await this.prisma.hike.findUnique({ where: { id } });
    if (!hike || hike.deletedAt) throw new NotFoundException('Hike not found');

    if (hike.authorId !== user.id && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Not allowed to edit this hike');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tagIds, bestMonths, ...updateData } = dto;

    return this.prisma.hike.update({
      where: { id },
      data: {
        regionId:      updateData.regionId,
        name:          updateData.name,
        description:   updateData.description,
        difficulty:    updateData.difficulty as any,
        hikeType:      updateData.hikeType as any,
        terrainType:   updateData.terrainType as any,
        practiceType:  updateData.practiceType as any,
        distanceKm:    updateData.distanceKm,
        elevationGainM: updateData.elevationGainM,
        elevationLossM: updateData.elevationLossM,
        durationMin:   updateData.durationMin,
        metaTitle:     updateData.metaTitle,
        metaDescription: updateData.metaDescription,
        updatedAt: new Date(),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tagId })),
          },
        }),
      },
    });
  }

  // ─── Soft Delete ──────────────────────────────────────────────────
  async remove(id: string) {
    const hike = await this.prisma.hike.findUnique({ where: { id } });
    if (!hike) throw new NotFoundException('Hike not found');
    await this.prisma.hike.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  // ─── Publish ─────────────────────────────────────────────────────
  async publish(id: string) {
    return this.prisma.hike.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    });
  }

  // ─── View Count ──────────────────────────────────────────────────
  async incrementViewCount(id: string) {
    await this.prisma.hike.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // ─── GPX Download URL ────────────────────────────────────────────
  async getGpxDownloadUrl(id: string, _userId: string) {
    const gpx = await this.prisma.gpxFile.findUnique({ where: { hikeId: id } });
    if (!gpx) throw new NotFoundException('GPX not found');

    // Increment download counter
    await this.prisma.hike.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    // Return presigned URL (S3/MinIO)
    return { url: `/api/v1/storage/presign/${gpx.storageKey}`, expiresIn: 3600 };
  }

  // ─── Nearby ──────────────────────────────────────────────────────
  async findNearby(id: string, radiusKm: number, limit: number) {
    const hike = await this.prisma.hike.findUnique({ where: { id } });
    if (!hike) throw new NotFoundException('Hike not found');

    // Raw PostGIS query for spatial search
    const nearby = await this.prisma.$queryRaw<any[]>`
      SELECT h.id, h.name, h.slug, h.difficulty, h.distance_km, h.avg_rating,
             h.featured_image_url,
             ST_Distance(h.center_point::geography, ref.center_point::geography) / 1000 as distance_km_away
      FROM hikes h, hikes ref
      WHERE ref.id = ${id}::uuid
        AND h.id != ${id}::uuid
        AND h.status = 'published'
        AND h.deleted_at IS NULL
        AND ST_DWithin(h.center_point::geography, ref.center_point::geography, ${radiusKm * 1000})
      ORDER BY distance_km_away ASC
      LIMIT ${limit}
    `;

    return nearby;
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true, locale: 'fr' });
    let slug = base;
    let i = 1;
    while (await this.prisma.hike.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }
}
