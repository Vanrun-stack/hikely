import { Module } from '@nestjs/common';
import { GpxController } from './gpx.controller';
import { GpxService } from './gpx.service';

@Module({
  controllers: [GpxController],
  providers: [GpxService],
  exports: [GpxService],
})
export class GpxModule {}
