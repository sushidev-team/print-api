import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({})
export class ConfigurationModule {
  static register(options): DynamicModule {
    return {
      module: ConfigurationModule,
      providers: [
        {
          provide: 'ConfigService',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}