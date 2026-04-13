import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Projeto Exemplo 2',
    maxLength: 255,
    description: 'Nome do projeto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'Cliente do projeto atualizado',
    description: 'Cliente do projeto',
  })
  @IsOptional()
  @IsString()
  client?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image2.jpg',
    description: 'URL da imagem do projeto',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o projeto é favorito',
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    example: '2026-04-11T03:00:00.000Z',
    description: 'Data de início do projeto',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2026-04-12T03:00:00.000Z',
    description: 'Data de término do projeto',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
