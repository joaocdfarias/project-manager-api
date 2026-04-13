import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '../entities/project.entity';
import {
  ListProjectFilters,
  ListProjectsResult,
  ProjectRepository,
} from '../repositories/project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async create(input: {
    name: string;
    client: string;
    imageUrl?: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Project> {
    try {
      const project = new Project(
        null,
        input.name,
        input.client ?? null,
        input.imageUrl ?? null,
        false,
        input.startDate ?? null,
        input.endDate ?? null,
        new Date(),
        new Date(),
      );

      return this.repository.save(project);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async getById(id: string): Promise<Project> {
    const project = await this.repository.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async list(filters: ListProjectFilters): Promise<ListProjectsResult> {
    const normalizedSearch = filters.search?.trim();

    if (normalizedSearch && normalizedSearch.length < 3) {
      throw new BadRequestException('Search must have at least 3 characters');
    }

    return this.repository.list({
      ...filters,
      search: normalizedSearch,
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      client?: string;
      imageUrl?: string;
      isFavorite?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Project> {
    const project = await this.getById(id);

    try {
      project.applyUpdate(input);

      return this.repository.save(project);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.repository.delete(id);
  }
}
