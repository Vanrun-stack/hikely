import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, data: { hikeId?: string; reviewId?: string; photoId?: string; reason: string; description?: string }) {
    return this.prisma.report.create({
      data: {
        reporterId,
        hikeId: data.hikeId,
        reviewId: data.reviewId,
        photoId: data.photoId,
        reason: data.reason as any,
        description: data.description,
      },
    });
  }
}
