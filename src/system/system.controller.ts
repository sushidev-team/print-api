import { Controller, Get, Res, Req, HttpStatus } from '@nestjs/common';
import { SystemService } from './system.service';

import { Response, Request } from 'express';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("api/status")
  @ApiOperation({description: 'Simple service healthcheck.'})
  @ApiResponse({ status: 200, description: 'Simple service healthcheck.' })
  @ApiTags("System")
  getStatus(@Res() res: Response, @Req() request:Request) {
    return this.systemService.getStatus(res);
  }
}
