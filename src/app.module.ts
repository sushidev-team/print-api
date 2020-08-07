import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrowserModule } from './browser/browser.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './configuration/configuration';

import { ConfigModule } from '@nestjs/config';
import { ConfigurationModule } from './configuration/configuration.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env']
  }), BrowserModule, ConfigurationModule,TerminusModule, TypeOrmModule.forRoot({
    type: 'sqlite',
    database: __dirname + '/../database/database.sqlite',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  })],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {
}
