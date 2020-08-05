import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

import * as express from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @ApiResponse({ status: 303, description: 'Will redirect to the healthcheck (/api/status).' })
  @ApiTags("System")
  postAuthRequest(@Res() response: express.Response) {
    return response.redirect(303, `/api/status`);
  }
}
