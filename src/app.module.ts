import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemModule } from './system/system.module';
import { BrowserModule } from './browser/browser.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './configuration/configuration';

import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env']
  }), SystemModule, BrowserModule, ConfigurationModule, TypeOrmModule.forRoot({
    type: 'sqlite',
    database: __dirname + '/../database/database.sqlite',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
