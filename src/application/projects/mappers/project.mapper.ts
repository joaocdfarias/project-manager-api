import { plainToInstance } from 'class-transformer';
import { Project } from '../../../domain/projects/entities/project.entity';
import { ProjectResponseDto } from '../dtos/project-response.dto';

export class ProjectResponseMapper {
  static toResponse(project: Project): ProjectResponseDto {
    const plain: ProjectResponseDto = {
      id: project.id,
      name: project.name,
      client: project.client,
      imageUrl: project.imageUrl,
      isFavorite: project.isFavorite,
      startDate: project.startDate,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return plainToInstance(ProjectResponseDto, plain, {
      excludeExtraneousValues: true,
    });
  }
}
