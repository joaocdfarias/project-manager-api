import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProjectResponseDto {
  @Expose()
  @ApiProperty({
    format: 'uuid',
    description: 'ID do projeto',
    example: '1c29b775-b631-4602-a8d7-b0a4428eb2ab',
  })
  id!: string | null;

  @Expose()
  @ApiProperty({ description: 'Nome do projeto', example: 'Projeto Exemplo' })
  name!: string;

  @Expose()
  @ApiProperty({
    description: 'Cliente do projeto',
    example: 'Cliente do projeto exemplo',
  })
  client!: string;

  @Expose()
  @ApiProperty({
    description: 'URL da imagem do projeto',
    example: 'https://example.com/image.jpg',
    nullable: true,
  })
  imageUrl!: string | null;

  @Expose()
  @ApiProperty({
    description: 'Indica se o projeto é favorito',
    example: false,
  })
  isFavorite!: boolean;

  @Expose()
  @ApiProperty({
    description: 'Data de início do projeto',
    example: '2026-04-11T03:00:00.000Z',
  })
  startDate!: Date;

  @Expose()
  @ApiProperty({
    description: 'Data de término do projeto',
    example: '2026-04-12T03:00:00.000Z',
  })
  endDate!: Date;

  @Expose()
  @ApiProperty({
    description: 'Data de criação do projeto',
    example: '2026-04-11T03:00:00.000Z',
  })
  createdAt!: Date;

  @Expose()
  @ApiProperty({
    description: 'Data de atualização do projeto',
    example: '2026-04-11T03:00:00.000Z',
  })
  updatedAt!: Date;
}
