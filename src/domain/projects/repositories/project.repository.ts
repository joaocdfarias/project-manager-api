import { Project } from '../entities/project.entity';

export enum ProjectSortOrder {
  ALPHABETICAL = 'alphabetical',
  RECENTLY_STARTED = 'recently_started',
  ENDING_SOON = 'ending_soon',
}

export interface ListProjectFilters {
  search?: string;
  favoritesOnly?: boolean;
  sort?: ProjectSortOrder;
  page?: number;
  limit?: number;
}

export interface ListProjectsResult {
  data: Project[];
  total: number;
}

export abstract class ProjectRepository {
  abstract save(project: Project): Promise<Project>;
  abstract findById(id: string): Promise<Project | null>;
  abstract list(filters: ListProjectFilters): Promise<ListProjectsResult>;
  abstract delete(id: string): Promise<void>;
}
