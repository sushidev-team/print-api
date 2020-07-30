import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemModule } from './system/system.module';
import { BrowserModule } from './browser/browser.module';

import configuration from './configuration/configuration';

import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env']
  }), SystemModule, BrowserModule, ConfigurationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
