import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Projeto Exemplo',
    maxLength: 255,
    required: true,
    description: 'Nome do projeto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'Cliente do projeto',
    required: true,
    description: 'Cliente do projeto',
  })
  @IsString()
  @IsNotEmpty()
  client!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL da imagem do projeto',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: '2026-04-11T03:00:00.000Z',
    required: true,
    description: 'Data de início do projeto',
  })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({
    example: '2026-04-12T03:00:00.000Z',
    required: true,
    description: 'Data de término do projeto',
  })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;
}
