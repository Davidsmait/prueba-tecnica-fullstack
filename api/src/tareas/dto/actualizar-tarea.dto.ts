import { PartialType } from '@nestjs/swagger';
import { CrearTareaDto } from './crear-tarea.dto';

export class ActualizarTareaDto extends PartialType(CrearTareaDto) {}
