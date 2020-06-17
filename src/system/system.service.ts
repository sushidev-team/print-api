import { Injectable, Res, HttpStatus } from '@nestjs/common';

@Injectable()
export class SystemService {
  getStatus(@Res() res) {
    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
    });
  }
}
