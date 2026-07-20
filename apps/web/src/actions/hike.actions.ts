'use server';

/**
 * Hike Server Actions
 * CRUD operations for hikes with PostGIS spatial queries.
 */
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
// Prisma types are inferred from the schema automatically

// ─── Types ───────────────────────────────────────────────────────

export type HikeFilters = {
  search?: string;
  difficulty?: string;
  hikeType?: string;
  practiceType?: string;
  regionId?: string;
  minDistance?: number;
  maxDistance?: number;
  minElevation?: number;
  maxElevation?: number;
  sortBy?: 'popular' | 'recent' | 'rating' | 'distance';
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

// ─── Get Hikes (with filters & pagination) ───────────────────────

export async function getHikes(
  filters: HikeFilters = {}
): Promise<PaginatedResult<any>> {
  const {
    search,
    difficulty,
    hikeType,
    practiceType,
    regionId,
    minDistance,
    maxDistance,
    minElevation,
    maxElevation,
    sortBy = 'popular',
    page = 1,
    limit = 12,
  } = filters;

  const where: Record<string, any> = {
    status: 'published' as const,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (difficulty) where.difficulty = difficulty as any;
  if (hikeType) where.hikeType = hikeType as any;
  if (practiceType) where.practiceType = practiceType as any;
  if (regionId) where.regionId = regionId;
  if (minDistance || maxDistance) {
    where.distanceKm = {};
    if (minDistance) where.distanceKm.gte = minDistance;
    if (maxDistance) where.distanceKm.lte = maxDistance;
  }
  if (minElevation || maxElevation) {
    where.elevationGainM = {};
    if (minElevation) where.elevationGainM.gte = minElevation;
    if (maxElevation) where.elevationGainM.lte = maxElevation;
  }

  const orderBy: Record<string, any> =
    sortBy === 'recent'
      ? { publishedAt: 'desc' }
      : sortBy === 'rating'
        ? { avgRating: 'desc' }
        : sortBy === 'distance'
          ? { distanceKm: 'asc' }
          : { viewCount: 'desc' }; // popular

  const [data, total] = await Promise.all([
    prisma.hike.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        region: {
          select: { id: true, name: true, country: true, slug: true },
        },
        _count: {
          select: { photos: true, reviews: true, favorites: true },
        },
      },
    }),
    prisma.hike.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Get Single Hike ─────────────────────────────────────────────

export async function getHikeBySlug(slug: string) {
  const hike = await prisma.hike.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
      },
      region: true,
      gpxFile: true,
      tags: { include: { tag: true } },
      photos: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      },
      _count: {
        select: { reviews: true, favorites: true, photos: true },
      },
    },
  });

  if (hike) {
    // Increment view count (fire and forget)
    prisma.hike.update({
      where: { id: hike.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  return hike;
}

// ─── Featured Hikes ──────────────────────────────────────────────

export async function getFeaturedHikes(limit = 6) {
  return prisma.hike.findMany({
    where: {
      status: 'published',
      deletedAt: null,
      reviewCount: { gt: 0 },
    },
    orderBy: [{ avgRating: 'desc' }, { viewCount: 'desc' }],
    take: limit,
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      region: {
        select: { name: true, country: true },
      },
      _count: {
        select: { photos: true, reviews: true },
      },
    },
  });
}

// ─── Create Hike ─────────────────────────────────────────────────

const createHikeSchema = z.object({
  name: z.string().min(3).max(300),
  description: z.string().optional(),
  difficulty: z.enum(['very_easy', 'easy', 'moderate', 'hard', 'expert']),
  hikeType: z.enum(['loop', 'out_and_back', 'point_to_point']),
  practiceType: z.enum(['hiking', 'trail_running', 'snowshoeing', 'mountain_biking', 'cycling']),
  regionId: z.string().uuid().optional(),
});

export async function createHike(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non autorisé');

  const raw = Object.fromEntries(formData);
  const parsed = createHikeSchema.parse(raw);

  // Generate slug
  const slug =
    parsed.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now().toString(36);

  const hike = await prisma.hike.create({
    data: {
      ...parsed,
      slug,
      authorId: session.user.id,
      regionId: parsed.regionId ?? null,
    },
  });

  revalidatePath('/hikes');
  revalidatePath('/dashboard/my-hikes');

  return hike;
}

// ─── Toggle Favorite (Optimistic UI ready) ───────────────────────

export async function toggleFavorite(hikeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non autorisé');

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_hikeId: {
        userId: session.user.id,
        hikeId,
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({
        where: { userId_hikeId: { userId: session.user.id, hikeId } },
      }),
      prisma.hike.update({
        where: { id: hikeId },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);
    return { favorited: false };
  } else {
    await prisma.$transaction([
      prisma.favorite.create({
        data: { userId: session.user.id, hikeId },
      }),
      prisma.hike.update({
        where: { id: hikeId },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);
    return { favorited: true };
  }
}

// ─── Get Regions ─────────────────────────────────────────────────

export async function getRegions() {
  return prisma.region.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { hikes: true } },
    },
  });
}

// ─── Platform Stats ──────────────────────────────────────────────

export async function getPlatformStats() {
  const [hikeCount, userCount, regionCount, reviewCount] = await Promise.all([
    prisma.hike.count({ where: { status: 'published' } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.region.count(),
    prisma.review.count({ where: { deletedAt: null } }),
  ]);

  return { hikeCount, userCount, regionCount, reviewCount };
}
