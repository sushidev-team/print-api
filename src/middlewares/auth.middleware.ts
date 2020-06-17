import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { constructor } from 'express';
import { ConfigService } from '@nestjs/config';
import { async } from 'rxjs/internal/scheduler/async';

const jwt = require('jsonwebtoken');
const encode = require('nodejs-base64-encode');

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private configService: ConfigService) {}

  async use(req: any, res: any, next: () => void) {
    
    const jwtActive = this.configService.get<boolean>('jwt.active');
    const basicAuthActive = this.configService.get<boolean>('basicAuth.active');

    if (jwtActive == true) {

        // Authentication via JWT
        let token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
        let secret = this.configService.get<string>('jwt.secret');

        let verify = jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            switch(err.name){
                case 'JsonWebTokenError':
                  throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    error: `[${err.name}]: ${err.message}`,
                    message: err.message
                  }, HttpStatus.UNAUTHORIZED);
                  break;
            }
          }
        });    
    }
    else if (basicAuthActive == true) {

        // Basic authentiation 
        let token = req.headers.authorization;
        let message;

        if (token === undefined || token.indexOf('Basic ') !== 0) {
            message = 'invalid authentication.';
            throw new HttpException({
              status: HttpStatus.UNAUTHORIZED,
              error: `[BASIC AUTH]: ${message}`,
              message: message
            }, HttpStatus.UNAUTHORIZED);
        }

        const base64Credentials =  token.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');  

        if (this.configService.get<string>('basicAuth.user') != username || this.configService.get<string>('basicAuth.secret') != password) {
            message = 'invalid credentials.';
            throw new HttpException({
              status: HttpStatus.UNAUTHORIZED,
              error: `[BASIC AUTH]: ${message}`,
              message: message
            }, HttpStatus.UNAUTHORIZED);
        }

    }
     
    next();
  }
}
