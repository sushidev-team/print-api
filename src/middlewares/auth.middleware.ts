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
    
    const jwtActive:boolean = this.configService.get<string>('jwt.active') == "true";
    const basicAuthActive:boolean = this.configService.get<string>('basicAuth.active') == "true";

    let allowed:boolean = true;

    if (jwtActive === true) {
        allowed = await this.checkJwt(req);        
    }
    else if (basicAuthActive === true) {
        allowed = await this.checkBasicAuth(req);  
    }

    if (allowed == false) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED
      }, HttpStatus.UNAUTHORIZED);
    }
     
    next();
  }

  /**
   * Check if the validation with JWT works
   * @param req 
   */
  protected checkJwt(req: any):boolean {

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
        return true;
      });  

      return (verify == true);

  }

  /**
   * Check basic authentication
   * @param req 
   */
  protected checkBasicAuth(req:any):boolean {

    // Basic authentiation 
    let token:string = req.headers.authorization;
    let message:string;

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
        return false;
    }

    return true;

  }

}
