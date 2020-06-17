import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

import * as express from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  postAuthRequest(@Res() response: express.Response) {
    return response.redirect(303, `/api/status`);
  }
}
