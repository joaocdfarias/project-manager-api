import { Module } from '@nestjs/common';
import { ConfigurationModule } from './infrastructure/configuration/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthModule } from './infrastructure/health/health.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
