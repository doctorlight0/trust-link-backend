import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { GiglLogisticsService } from './gigl/gigl-logistics.service';
import { GiglClient } from './gigl/gigl.client';
import { LogisticsService } from './logistics.service';
import { ProviderCredentialRepository } from './provider-credential.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ProviderCredentialRepository,
    GiglLogisticsService,
    {
      provide: LogisticsService,
      useExisting: GiglLogisticsService,
    },
    {
      provide: GiglClient,
      useFactory: (config: ConfigService, logisticsService: GiglLogisticsService) => {
        const baseUrl = config.get<string>('LOGISTICS_API_BASE_URL');

        if (!baseUrl) {
          return null;
        }

        // Read the key dynamically so rotations via rotateApiKey() take effect
        // immediately without a process restart (issue #1054).
        return new GiglClient({
          baseUrl,
          getApiToken: () => logisticsService.getApiKey(),
        });
      },
      inject: [ConfigService, GiglLogisticsService],
    },
  ],
  exports: [GiglClient, GiglLogisticsService, LogisticsService],
})
export class LogisticsModule {}
