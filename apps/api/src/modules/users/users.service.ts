import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarUrl: true, bio: true, role: true, level: true,
        xpPoints: true, isVerified: true, createdAt: true,
        _count: { select: { hikes: true, reviews: true, followers: true, following: true } },
      },
    });
    if (!user || (user as any).deletedAt) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true,
        bio: true, level: true, xpPoints: true, isVerified: true, createdAt: true,
        badges: { include: { badge: true } },
        hikes: {
          where: { status: 'published', deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { id: true, name: true, slug: true, distanceKm: true, difficulty: true, featuredImageUrl: true, avgRating: true },
        },
        _count: { select: { hikes: true, reviews: true, followers: true, following: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { displayName?: string; bio?: string; avatarUrl?: string; websiteUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
