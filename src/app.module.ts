import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemModule } from './system/system.module';
import { BrowserModule } from './browser/browser.module';

import configuration from './config/configuration';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
  }), SystemModule, BrowserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
