import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HikesModule } from './modules/hikes/hikes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PhotosModule } from './modules/photos/photos.module';
import { GpxModule } from './modules/gpx/gpx.module';
import { SearchModule } from './modules/search/search.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BadgesModule } from './modules/badges/badges.module';
import { AdminModule } from './modules/admin/admin.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // ─── Config ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Rate Limiting ───────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    // ─── Queue (BullMQ) ──────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('REDIS_URL'),
      }),
    }),

    // ─── Health ──────────────────────────────────────────────────
    TerminusModule,

    // ─── Core ────────────────────────────────────────────────────
    DatabaseModule,
    AuthModule,
    UsersModule,
    HikesModule,
    ReviewsModule,
    PhotosModule,
    GpxModule,
    SearchModule,
    FavoritesModule,
    ReportsModule,
    BadgesModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
