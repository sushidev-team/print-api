import { Controller, Get, Post, Body, Res,Req, HttpStatus, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { CreateBrowserDto,CreateBrowserResponseDto } from '../dto/create-browser.dto';
import { Response, Request } from 'express';

import { v4 as uuidv4  } from 'uuid';
import { BrowseGuard } from 'src/guards/browse.guard';
import signed, { Signature } from 'signed';
import { ConfigService } from '@nestjs/config';

const fs = require("fs");
const oppressor = require('oppressor');
const request = require('request');

@Controller()
export class BrowserController {

  private signature:Signature;

  constructor(private readonly browserService: BrowserService, private readonly configService: ConfigService) {
    this.signature = signed({
      secret: this.configService.get<string>('key')
    });
  }

  @Get("api/browse/:id")
  async file(@Param() params, @Req() req: Request, @Res() res: Response) {

    let stream = fs.createReadStream(`./storage/${params.id}.pdf`);

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': stream.length,
    });
    
    stream.pipe(oppressor(req)).pipe(res);

  }

  @Post("api/browse")
  @UseGuards(BrowseGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createSession: CreateBrowserDto, @Res() res: Response, @Req() request:Request) { 

    let result = await this.browserService.savePage(createSession.url, createSession.filename);
    let resultUpload = false;

    if (createSession.postBackUrl) {

        resultUpload = await this.browserService.uploadFile(request, result.id, createSession);

        // Delete the file after uploading to the endpoint
        if (resultUpload) {
          await this.browserService.deleteFile(result.storagePath);
        }
        
    }

    res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        requestUrl: createSession.url,
        downloadUrl: resultUpload == false ? this.signature.sign(`http://${request.headers.host}/api/browse/${result.id}`) : null,
        uploaded: resultUpload
    });
 
  }
}
