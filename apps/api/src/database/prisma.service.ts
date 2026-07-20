import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'> implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected');

    // Slow query logging in dev
    if (process.env.NODE_ENV !== 'production') {
      // Prisma event typing
      this.$on('query', (e: { query: string; duration: number }) => {
        if (e.duration > 200) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /** Soft delete helper */
  async softDelete(model: string, id: string) {
    return (this as unknown as Record<string, { update: (args: any) => any }>)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
