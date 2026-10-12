import { BadRequestException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { diskStorage } from 'multer';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
]);

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const destino = resolve(config.get<string>('UPLOAD_DIR', './uploads'));
        mkdirSync(destino, { recursive: true });
        return {
          storage: diskStorage({
            destination: destino,
            filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
          }),
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: (_req, file, cb) =>
            TIPOS_PERMITIDOS.has(file.mimetype)
              ? cb(null, true)
              : cb(new BadRequestException('Tipo de archivo no permitido (PDF, imagen o texto)'), false),
        };
      },
    }),
  ],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}
