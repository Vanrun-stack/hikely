'use server';

/**
 * Review Server Actions
 * Create, list, and manage reviews with optimistic-ready responses.
 */
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────────

const createReviewSchema = z.object({
  hikeId: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5),
  content: z.string().min(10, 'Minimum 10 caractères').max(2000).optional(),
  conditions: z.string().optional(),
});

// ─── Get Reviews for a Hike ──────────────────────────────────────

export async function getReviews(
  hikeId: string,
  page = 1,
  limit = 10
) {
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { hikeId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { hikeId, deletedAt: null } }),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Create Review ───────────────────────────────────────────────

export async function createReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non autorisé');

  const raw = Object.fromEntries(formData);
  const parsed = createReviewSchema.parse(raw);

  // Check if user already reviewed this hike
  const existing = await prisma.review.findUnique({
    where: {
      hikeId_authorId: {
        hikeId: parsed.hikeId,
        authorId: session.user.id,
      },
    },
  });

  if (existing) {
    throw new Error('Vous avez déjà publié un avis pour cette randonnée');
  }

  const review = await prisma.review.create({
    data: {
      hikeId: parsed.hikeId,
      authorId: session.user.id,
      rating: parsed.rating,
      content: parsed.content,
      conditions: parsed.conditions,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          level: true,
        },
      },
    },
  });

  // Update hike aggregate stats
  const stats = await prisma.review.aggregate({
    where: { hikeId: parsed.hikeId, deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.hike.update({
    where: { id: parsed.hikeId },
    data: {
      avgRating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });

  revalidatePath(`/hikes`);

  return review;
}

// ─── Delete Review ───────────────────────────────────────────────

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non autorisé');

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review || review.authorId !== session.user.id) {
    throw new Error('Non autorisé');
  }

  // Soft delete
  await prisma.review.update({
    where: { id: reviewId },
    data: { deletedAt: new Date() },
  });

  // Recalculate stats
  const stats = await prisma.review.aggregate({
    where: { hikeId: review.hikeId, deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.hike.update({
    where: { id: review.hikeId },
    data: {
      avgRating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });

  revalidatePath(`/hikes`);
}
