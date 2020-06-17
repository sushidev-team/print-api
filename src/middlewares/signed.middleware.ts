import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import signed, { Signature, VerifyResult } from 'signed';

@Injectable()
export class SignedMiddleware implements NestMiddleware {

  private signature: Signature;

  constructor(private configService: ConfigService) {

    this.signature = signed({
      secret: this.configService.get<string>('key')
    });

  }

  use(req: any, res: any, next: () => void) {
    
    let result:VerifyResult = this.signature.verifyUrl(req);

    if (result === 1) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'invalid url'
      }, HttpStatus.FORBIDDEN);
    }

    next();
  }
}
