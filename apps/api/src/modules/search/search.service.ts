import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchHikes(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = query
      ? {
          status: 'published' as const,
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
          ],
          deletedAt: null,
        }
      : { status: 'published' as const, deletedAt: null };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.hike.findMany({
        where,
        skip,
        take: limit,
        orderBy: { avgRating: 'desc' },
        select: {
          id: true, name: true, slug: true, difficulty: true,
          distanceKm: true, elevationGainM: true, durationMin: true,
          avgRating: true, reviewCount: true, featuredImageUrl: true,
          region: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.hike.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
