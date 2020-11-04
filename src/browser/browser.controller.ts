import { Controller, Get, Post, Body, Res, Req, HttpStatus, Param, UseGuards, UsePipes, ValidationPipe, Delete, Put } from '@nestjs/common';
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
import { UpdateBrowserDto } from 'src/dto/update-browser.dto';
import { getConnection } from 'typeorm';

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
           "autodelete": file.autodelete,
           "printed": file.printed
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

      if (!params) {
        throw "Incorrect params";
      }
      
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
          'Content-Disposition': 'form-data;filename="' + fileEntry.filename_return +'.pdf"'
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

  @Put("api/browse/:id")
  @ApiOperation({description: 'Update data from the application'})
  @ApiResponse({ status: 200, description: 'Will return the current data object' })
  @ApiTags("Manage documents")
  @UseGuards(BrowseGuard)
  async updateFile(@Param() params, @Req() req: Request, @Res() res: Response, @Body() updateData: UpdateBrowserDto) {

    let fileEntry = await this.browserService.find(params.id);
    let allowedKeys = Object.keys(getConnection().getMetadata(Browse).propertiesMap);

    for (let param in updateData) {
      if (allowedKeys.includes(param) && param != 'id') {

        switch(param) {
           case 'filename':
            updateData[param].includes(".pdf") ? fileEntry[param] = updateData[param].toString() : fileEntry[param] = updateData[param].toString() + ".pdf";
            break;
           default:
            fileEntry[param] = updateData[param];
            break;
        }
      }
    }

    this.browserService.update(fileEntry);

    res.status(HttpStatus.OK).json(
      {
        "id": fileEntry.id,
        "filename": fileEntry.filename_return,
        "path": this.signature.sign(`${req.protocol}://${req.headers.host}/api/browse/${fileEntry.id}`),
        "created_at": fileEntry.created_at,
        "updated_at": fileEntry.updated_at,
        "downloads": fileEntry.downloads,
        "autodelete": fileEntry.autodelete,
        "printed": fileEntry.printed
     }
    ); 
  
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

    // Create the database entry for the file
    let browseEntry: Browse = new Browse();

    browseEntry.id = uuidv4();
    browseEntry.filename = browseEntry.id;
    browseEntry.filename_return = (createSession.filename ? createSession.filename.toString() : browseEntry.id.toString());
    browseEntry.autodelete = createSession.autodelete;

    this.browserService.create(browseEntry);

    let result = await this.browserService.savePage(createSession.url, browseEntry.id,  createSession.filename ? createSession.filename : browseEntry.id );
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

    res.status(HttpStatus.OK).json(new PdfResult({
        statusCode: HttpStatus.OK,
        requestUrl: createSession.url,
        downloadUrl: resultUpload == false ? this.signature.sign(`${request.protocol}://${request.headers.host}/api/browse/${result.id}`) : null,
        id: result.id,
        filename: browseEntry.filename_return,
        uploaded: resultUpload,
        waited: createSession.postBackWait,   
        autodelete: createSession.autodelete   
    }));
 
  }
}
