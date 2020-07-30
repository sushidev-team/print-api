import { Controller, Get, Post, Body, Res,Req, HttpStatus, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { CreateBrowserDto,CreateBrowserResponseDto } from '../dto/create-browser.dto';
import { Response, Request } from 'express';

import { v4 as uuidv4  } from 'uuid';
import { BrowseGuard } from 'src/guards/browse.guard';
import signed, { Signature } from 'signed';
import { ConfigService } from '@nestjs/config';
import { PdfResult } from 'src/models/PdfResult';

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

  @Get("api/browse")
  @UseGuards(BrowseGuard)
  async files(@Param() params, @Req() req: Request, @Res() res: Response) {

    let result = await fs.promises.readdir(`./storage/`);

    result = result.filter(file => {
      if (file.substr(0,1) !== '.') {
         return file;
      }
    });

    result = result.map(file => {
       let id = file.substr(0, file.length - 4);
       return {
          "file": file,
          "path": this.signature.sign(`${req.protocol}://${req.headers.host}/api/browse/${id}`),
       };
    })

    res.status(HttpStatus.OK).json(result);

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

    createSession.postBackWait = createSession.postBackWait == true;

    if (createSession.postBackUrl) {

        if (createSession.postBackWait != false) {

          resultUpload = await this.browserService.uploadFile(request, result.id, createSession);

          // Delete the file after uploading to the endpoint
          if (resultUpload) {
            await this.browserService.deleteFile(result.storagePath);
          }

        }        
        else {

          this.browserService.uploadFile(request, result.id, createSession).then(() => {
             this.browserService.deleteFile(result.storagePath)
          });

        }
        
    }

    res.status(HttpStatus.OK).json(new PdfResult({
        statusCode: HttpStatus.OK,
        requestUrl: createSession.url,
        downloadUrl: resultUpload == false ? this.signature.sign(`${request.protocol}://${request.headers.host}/api/browse/${result.id}`) : null,
        filename: result.id,
        uploaded: resultUpload,
        waited: createSession.postBackWait
    }));
 
  }
}
