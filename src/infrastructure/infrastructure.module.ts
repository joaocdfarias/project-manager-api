import { Module } from '@nestjs/common';
import { ConfigurationModule } from './configuration/configuration.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './logging/logging.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    LoggingModule,
    HealthModule,
    StorageModule,
  ],
  exports: [DatabaseModule, StorageModule],
})
export class InfrastructureModule {}
