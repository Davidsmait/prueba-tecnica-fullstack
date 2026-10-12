import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { resolve } from 'node:path';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { ListarTareasDto } from './dto/listar-tareas.dto';
import { TareasService } from './tareas.service';

@ApiTags('tareas')
@ApiBearerAuth()
@Controller('tareas')
export class TareasController {
  private readonly uploadDir: string;

  constructor(
    private readonly tareas: TareasService,
    config: ConfigService,
  ) {
    this.uploadDir = resolve(config.get<string>('UPLOAD_DIR', './uploads'));
  }

  @Get()
  listar(@Query() query: ListarTareasDto) {
    return this.tareas.listar(query);
  }

  @Get('resumen')
  resumen() {
    return this.tareas.resumen();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.tareas.obtener(id);
  }

  @Post()
  crear(@Body() dto: CrearTareaDto) {
    return this.tareas.crear(dto);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTareaDto) {
    return this.tareas.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.tareas.eliminar(id, this.uploadDir);
  }

  @Post(':id/adjunto')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { archivo: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('archivo'))
  adjuntar(@Param('id', ParseIntPipe) id: number, @UploadedFile() archivo?: Express.Multer.File) {
    if (!archivo) throw new BadRequestException('Envía un archivo en el campo "archivo"');
    return this.tareas.adjuntar(id, archivo, this.uploadDir);
  }

  @Get(':id/adjunto')
  async descargar(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const tarea = await this.tareas.obtener(id);
    if (!tarea.adjuntoArchivo) throw new BadRequestException('La tarea no tiene adjunto');
    res.download(resolve(this.uploadDir, tarea.adjuntoArchivo), tarea.adjuntoNombre ?? tarea.adjuntoArchivo);
  }
}
