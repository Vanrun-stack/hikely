import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GpxService {
  constructor(private readonly prisma: PrismaService) {}

  async getGpxFile(hikeId: string) {
    const gpxFile = await this.prisma.gpxFile.findUnique({ where: { hikeId } });
    if (!gpxFile) throw new NotFoundException('GPX file not found');
    return gpxFile;
  }

  async updateProcessingStatus(id: string, status: string) {
    return this.prisma.gpxFile.update({ where: { id }, data: { processingStatus: status } });
  }
}
