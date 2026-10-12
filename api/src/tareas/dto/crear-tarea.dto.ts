import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearTareaDto {
  @ApiProperty({ example: 'Preparar entrega', maxLength: 120 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo!: string;

  @ApiPropertyOptional({ example: 'Subir el repositorio a GitHub', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  completado?: boolean;
}
