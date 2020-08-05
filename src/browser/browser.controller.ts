import { Controller, Get, Post, Body, Res, Req, HttpStatus, Param, UseGuards, UsePipes, ValidationPipe, Delete } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { CreateBrowserDto,CreateBrowserResponseDto } from '../dto/create-browser.dto';
import { Response, Request } from 'express';

import { v4 as uuidv4  } from 'uuid';
import { BrowseGuard } from 'src/guards/browse.guard';
import signed, { Signature } from 'signed';
import { ConfigService } from '@nestjs/config';
import { PdfResult } from 'src/models/PdfResult';
import { Browse } from './browse.entity';
import { ApiResponse, ApiBasicAuth, ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

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
  @ApiOperation({description: 'Get a list of all pdf documents.'})
  @ApiResponse({ status: 200, description: 'Returns a list of all pdf documents from the server.' })
  @ApiBasicAuth()
  @ApiBearerAuth()
  @ApiTags("Manage documents")
  async files(@Param() params, @Req() req: Request, @Res() res: Response) {

    let result;

    try {

      result = await this.browserService.findAll();
      result = result.map(file => {
 
        return {
           "id": file.id,
           "filename": file.filename,
           "path": this.signature.sign(`${req.protocol}://${req.headers.host}/api/browse/${file.id}`),
           "created_at": file.created_at,
           "updated_at": file.updated_at,
           "downloads": file.downloads,
           "autodelete": file.autodelete
        };
     })
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: `Something went wrong.`}); 
    }

    res.status(HttpStatus.OK).json(result);

  }

  @Get("api/browse/:id")
  @ApiOperation({description: 'Download a single file.'})
  @ApiResponse({ status: 200, description: 'Will return the actual file.' })
  @ApiTags("Manage documents")
  async file(@Param() params, @Req() req: Request, @Res() res: Response) {

    let fileEntry;
    let stream;

    try {
      
      fileEntry = await this.browserService.find(params.id);

      if (!fileEntry) {
        throw "File not found";
      }

      stream = fs.createReadStream(`./storage/${params.id}.pdf`);

      fileEntry.downloads++;
      this.browserService.update(fileEntry);

      res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': stream.length,
          'Content-Disposition': 'form-data;filename="' + fileEntry.filename +'"'
      });
      
      stream.pipe(oppressor(req)).pipe(res);

      // Delete the file if autodelete flag is active
      if (fileEntry.autodelete) {
        this.browserService.delete(params.id);
      }
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: `Something went wrong. The file might be already deleted.`}); 
    }
  }

  @Delete("api/browse/:id")
  @UseGuards(BrowseGuard)
  @ApiOperation({description: 'Delete a file'})
  @ApiResponse({ status: 200, description: 'Will delete the file.' })
  @ApiBasicAuth()
  @ApiBearerAuth()
  @ApiTags("Manage documents")
  async fileDestroy(@Param() params, @Req() req: Request, @Res() res: Response) {

    let id = params.id.indexOf('.pdf') > -1 ? params.id.substr(0, params.id.length - 4) : params.id;
    
    try {
      this.browserService.delete(id);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: `Something went wrong while trying to delete "${id}"`}); 
    }
    
    res.status(HttpStatus.OK).json({statusCode:HttpStatus.OK}); 

  }

  @Post("api/browse")
  @UseGuards(BrowseGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({description: 'Create a pdf document based on a url.'})
  @ApiResponse({ status: 200, description: 'Will open the url an create a pdf document.' })
  @ApiBasicAuth()
  @ApiBearerAuth()
  @ApiTags("Create pdf documents")
  async create(@Body() createSession: CreateBrowserDto, @Res() res: Response, @Req() request:Request) { 

    let result = await this.browserService.savePage(createSession.url);
    let resultUpload = false;
    let resultUploadFailed = false;

    createSession.autodelete = createSession.autodelete == true;
    createSession.postBackWait = createSession.postBackWait == true;

    if (createSession.postBackUrl) {

        if (createSession.postBackWait != false) {

          resultUpload = await this.browserService.uploadFile(request, result.id, createSession);

          // Delete the file after uploading to the endpoint
          if (resultUpload) {
            await this.browserService.deleteFile(result.storagePath);
          }
          else {
            resultUploadFailed = true;
          }

        }        
        else {

          this.browserService.uploadFile(request, result.id, createSession).then(() => {
             this.browserService.deleteFile(result.storagePath)
          });

        }
        
    }

    // Create the database entry for the file
    let browseEntry: Browse = new Browse();

    browseEntry.id = result.id.toString();
    browseEntry.filename = (createSession.filename ? createSession.filename.toString() : result.id.toString()) + '.pdf';
    browseEntry.autodelete = resultUploadFailed || createSession.autodelete;

    this.browserService.create(browseEntry);

    res.status(HttpStatus.OK).json(new PdfResult({
        statusCode: HttpStatus.OK,
        requestUrl: createSession.url,
        downloadUrl: resultUpload == false ? this.signature.sign(`${request.protocol}://${request.headers.host}/api/browse/${result.id}`) : null,
        id: result.id,
        filename: browseEntry.filename,
        uploaded: resultUpload,
        waited: createSession.postBackWait,   
        autodelete: createSession.autodelete   
    }));
 
  }
}
