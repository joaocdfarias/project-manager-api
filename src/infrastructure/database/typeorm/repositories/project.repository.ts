import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../../domain/projects/entities/project.entity';
import {
  ListProjectFilters,
  ListProjectsResult,
  ProjectRepository,
  ProjectSortOrder,
} from '../../../../domain/projects/repositories/project.repository';
import { ProjectEntity } from '../entities/project.entity';

@Injectable()
export class ProjectTypeormRepository extends ProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repository: Repository<ProjectEntity>,
  ) {
    super();
  }

  async save(project: Project): Promise<Project> {
    const entity = this.repository.create({
      id: project.id ?? undefined,
      name: project.name,
      client: project.client,
      imageUrl: project.imageUrl,
      isFavorite: project.isFavorite,
      startDate: project.startDate,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Project | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async list(filters: ListProjectFilters): Promise<ListProjectsResult> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const qb = this.repository.createQueryBuilder('project');

    if (filters.search) {
      qb.andWhere('LOWER(project.name) LIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      });
    }

    if (typeof filters.favoritesOnly === 'boolean') {
      qb.andWhere('project.isFavorite = :isFavorite', {
        isFavorite: filters.favoritesOnly,
      });
    }

    switch (filters.sort ?? ProjectSortOrder.ALPHABETICAL) {
      case ProjectSortOrder.RECENTLY_STARTED:
        qb.orderBy('project.startDate', 'DESC', 'NULLS LAST');
        break;
      case ProjectSortOrder.ENDING_SOON:
        qb.orderBy('project.endDate', 'ASC', 'NULLS LAST');
        break;
      default:
        qb.orderBy('project.name', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((item) => this.toDomain(item)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: ProjectEntity): Project {
    return new Project(
      entity.id,
      entity.name,
      entity.client,
      entity.imageUrl,
      entity.isFavorite,
      entity.startDate,
      entity.endDate,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
