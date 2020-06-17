import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

const jwt = require('jsonwebtoken');

@Injectable()
export class BrowseGuard implements CanActivate {

  constructor(@Inject('CONFIG_OPTIONS') private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const jwtActive = this.configService.get<boolean>('jwt.active');
    const token = request.headers.authorization ? request.headers.authorization.replace('Bearer ', '') : '';  

    if (jwtActive == true) {
      const data  = jwt.decode(token);
      return data.permissions === undefined || data.permissions.indexOf(this.configService.get<string>('permissions.browse')) > -1 || data.permissions.indexOf('*') > -1;
    }
    else {
      return true;
    } 
  }
}
