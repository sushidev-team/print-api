import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { BrowserController } from './browser.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { SignedMiddleware } from 'src/middlewares/signed.middleware';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Browse } from './browse.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Browse]),],
    controllers:[BrowserController],
    providers: [BrowserService, {provide: 'CONFIG_OPTIONS', useValue: ConfigService},],
})
export class BrowserModule {

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: 'api/browse/:id', method: RequestMethod.GET}
            )
            .forRoutes(BrowserController);

        consumer
            .apply(SignedMiddleware)
            .exclude(
                
            )
            .forRoutes({ path: 'api/browse/:id', method: RequestMethod.GET });
      }
}
