import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, hikes, reviews, reports] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.hike.count({ where: { status: 'published' } }),
      this.prisma.review.count(),
      this.prisma.report.count({ where: { status: 'open' } }),
    ]);
    return { users, hikes, reviews, openReports: reports };
  }

  async getPendingHikes() {
    return this.prisma.hike.findMany({
      where: { status: 'pending_review' },
      include: { author: { select: { id: true, username: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
