import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, hikeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_hikeId: { userId, hikeId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { userId_hikeId: { userId, hikeId } } });
      await this.prisma.hike.update({ where: { id: hikeId }, data: { favoriteCount: { decrement: 1 } } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, hikeId } });
    await this.prisma.hike.update({ where: { id: hikeId }, data: { favoriteCount: { increment: 1 } } });
    return { favorited: true };
  }

  findByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        hike: {
          select: {
            id: true, name: true, slug: true, difficulty: true,
            distanceKm: true, elevationGainM: true, avgRating: true,
            featuredImageUrl: true,
            region: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
