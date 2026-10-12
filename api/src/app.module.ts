import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenAuthMiddleware } from './auth/token-auth.middleware';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TareasController } from './tareas/tareas.controller';
import { TareasModule } from './tareas/tareas.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, TareasModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenAuthMiddleware).forRoutes(TareasController);
  }
}
