import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';

export class ProjectsListResponseDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ type: [ProjectResponseDto] })
  data!: ProjectResponseDto[];
}
