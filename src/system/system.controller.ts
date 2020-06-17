import { Controller, Get, Res, Req, HttpStatus } from '@nestjs/common';
import { SystemService } from './system.service';

import { Response, Request } from 'express';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("api/status")
  getStatus(@Res() res: Response, @Req() request:Request) {
    return this.systemService.getStatus(res);
  }
}
