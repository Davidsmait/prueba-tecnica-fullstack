import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Tarea } from '@prisma/client';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { ListarTareasDto } from './dto/listar-tareas.dto';

export interface Paginado<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

@Injectable()
export class TareasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar({ pagina, limite, completado, buscar }: ListarTareasDto): Promise<Paginado<Tarea>> {
    const where: Prisma.TareaWhereInput = {
      ...(completado !== undefined && { completado }),
      ...(buscar && {
        OR: [
          { titulo: { contains: buscar, mode: 'insensitive' } },
          { descripcion: { contains: buscar, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.tarea.findMany({
        where,
        orderBy: { fechaCreacion: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.prisma.tarea.count({ where }),
    ]);

    return { data, total, pagina, limite, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
  }

  async resumen() {
    const [total, completadas] = await this.prisma.$transaction([
      this.prisma.tarea.count(),
      this.prisma.tarea.count({ where: { completado: true } }),
    ]);
    return { total, completadas, pendientes: total - completadas };
  }

  async obtener(id: number): Promise<Tarea> {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (!tarea) throw new NotFoundException(`La tarea ${id} no existe`);
    return tarea;
  }

  crear(dto: CrearTareaDto): Promise<Tarea> {
    return this.prisma.tarea.create({ data: dto });
  }

  async actualizar(id: number, dto: ActualizarTareaDto): Promise<Tarea> {
    await this.obtener(id);
    return this.prisma.tarea.update({ where: { id }, data: dto });
  }

  async eliminar(id: number, uploadDir: string): Promise<void> {
    const tarea = await this.obtener(id);
    await this.prisma.tarea.delete({ where: { id } });
    if (tarea.adjuntoArchivo) await this.borrarArchivo(uploadDir, tarea.adjuntoArchivo);
  }

  async adjuntar(id: number, archivo: Express.Multer.File, uploadDir: string): Promise<Tarea> {
    const tarea = await this.obtener(id);
    if (tarea.adjuntoArchivo) await this.borrarArchivo(uploadDir, tarea.adjuntoArchivo);
    return this.prisma.tarea.update({
      where: { id },
      data: {
        adjuntoNombre: archivo.originalname,
        adjuntoArchivo: archivo.filename,
        adjuntoMime: archivo.mimetype,
      },
    });
  }

  private async borrarArchivo(uploadDir: string, archivo: string) {
    await unlink(join(uploadDir, archivo)).catch(() => undefined);
  }
}
