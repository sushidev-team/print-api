import { Injectable } from '@nestjs/common';
import { rejects } from 'assert';

import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4  } from 'uuid';
import { CreateBrowserResponseDto, CreateBrowserDto } from 'src/dto/create-browser.dto';

import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Browse } from './browse.entity';

import { UpdateResult, DeleteResult } from  'typeorm';

const puppeteer = require('puppeteer');
const fs = require('fs');
const FormData = require('form-data');

@Injectable()
export class BrowserService {

  constructor(
    @InjectRepository(Browse)
        private browseRepository: Repository<Browse>,
        private configService: ConfigService
    ) {}
  
  
  async  findAll(): Promise<Browse[]> {
      return await this.browseRepository.find();
  }

  async find(Id: string): Promise<Browse> {
    return await this.browseRepository.findOne(Id);
  }

  async  create(browse: Browse): Promise<Browse> {
      return await this.browseRepository.save(browse);
  }

  async update(browse: Browse): Promise<UpdateResult> {
      return await this.browseRepository.update(browse.id, browse);
  }

  async delete(id): Promise<DeleteResult> {
      let path = `./storage/${id}.pdf`;
      this.deleteFile(path);
      return await this.browseRepository.delete(id);
  }

  /**
   * Create the pdf document
   * @param path 
   * @param filename 
   */
  async savePage(path: String, filename?: String): Promise<CreateBrowserResponseDto> {

    const executablePath = this.configService.get<string>('browser');
    let settings:any = {headless:true, 'args':["--no-sandbox", "--disable-setuid-sandbox"]};
  
    if (executablePath !== null && executablePath !== '') {
       settings.executablePath = this.configService.get<string>('browser');
    }
    
    filename ? filename : filename = uuidv4();
    const pathToFile = `storage/${filename}.pdf`;
    const browser = await puppeteer.launch(settings);
    const page = await browser.newPage();

    await page.goto(path, {waitUntil: 'networkidle2'});
    await page.pdf({path: pathToFile, format: 'A4'});
    await browser.close();

    return new Promise((resolve, rejects) => {
       resolve(new CreateBrowserResponseDto(filename, path, pathToFile));
    });

  }

  /**
   * Upload the file to a different server
   * @param request 
   * @param filename 
   * @param session 
   */
  async uploadFile(request: Request, filename: String, session: CreateBrowserDto) :Promise<boolean> {

    const jwtActive = this.configService.get<boolean>('jwt.active');
    const basicAuthActive = this.configService.get<boolean>('basicAuth.active');

    let headers:any;
    let successful:boolean = false;

    try {

      const fileForTransmission = fs.createReadStream(`storage/${filename}.pdf`);

      const formData = new FormData();
      formData.append("file", fileForTransmission, `${filename}.pdf`);

      if (session.filename !== undefined) {
         formData.append("filename", session.filename);
      }

      if (session.postBackBody) {
         formData.append("data", session.postBackBody ? JSON.stringify(session.postBackBody) : {});
      }
      
      headers = formData.getHeaders();
      headers['authorization'] = session.token !== undefined && session.token !== null && session.token !== '' ? session.token : ((jwtActive == true || basicAuthActive == true) && request.headers.authorization ? request.headers.authorization : '');

      const result:AxiosResponse = await axios.post(session.postBackUrl.toString(), formData, {
        headers: headers,
      });

      successful = true;

    } catch(err) {
      
      console.log('Error occurred while trying to upload file.');
      console.log(err); 
      successful = false;

    }

    return new Promise((resolve, rejects) => {
      successful ? resolve(true) : resolve(false);
    });  

  }

  /**
   * Create a file from storage
   * @param path 
   */
  async deleteFile(path: String):Promise<boolean>  {
    return new Promise((resolve, rejects) => {
      resolve(fs.unlinkSync(path));
    });  

  }

}
