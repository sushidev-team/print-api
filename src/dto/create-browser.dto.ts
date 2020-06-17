import { IsNotEmpty } from 'class-validator';

export class CreateBrowserDto {
    
    @IsNotEmpty()
    url: String;

    filename: String;
    postBackUrl: String;
    postBackBody: Object;
    token: String;
    
}

export class CreateBrowserResponseDto {
    url: String;
    id: String;
    storagePath: String;

    constructor(id:String, url:String, path: String){
        this.id = id;
        this.url = url;
        this.storagePath = path;
    }
}