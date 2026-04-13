import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRepository } from '../../domain/projects/repositories/project.repository';
import { ProjectService } from '../../domain/projects/services/project.service';
import { ProjectEntity } from '../../infrastructure/database/typeorm/entities/project.entity';
import { ProjectTypeormRepository } from '../../infrastructure/database/typeorm/repositories/project.repository';
import { ProjectsController } from '../projects/controllers/project.controller';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), StorageModule],
  controllers: [ProjectsController],
  providers: [
    ProjectService,
    {
      provide: ProjectRepository,
      useClass: ProjectTypeormRepository,
    },
  ],
})
export class ProjectsModule {}
