import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByHike(hikeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.review.findMany({
      where: { hikeId, deletedAt: null },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async create(userId: string, hikeId: string, data: { rating: number; content?: string; visitedAt?: string; conditions?: string }) {
    const existing = await this.prisma.review.findUnique({
      where: { hikeId_authorId: { hikeId, authorId: userId } },
    });
    if (existing) throw new ConflictException('You already reviewed this hike');

    const review = await this.prisma.review.create({
      data: { hikeId, authorId: userId, rating: data.rating, content: data.content, conditions: data.conditions },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    // Update average rating
    const agg = await this.prisma.review.aggregate({ where: { hikeId, deletedAt: null }, _avg: { rating: true }, _count: true });
    await this.prisma.hike.update({
      where: { id: hikeId },
      data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });

    return review;
  }
}
