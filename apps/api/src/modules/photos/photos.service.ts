import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  findByHike(hikeId: string) {
    return this.prisma.photo.findMany({
      where: { hikeId, deletedAt: null },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    });
  }
}
