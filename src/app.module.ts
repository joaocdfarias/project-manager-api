import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProjectsModule } from './application/projects/project.module';
import { ApiKeyGuard } from './infrastructure/guards/api-key.guard';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, ProjectsModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
