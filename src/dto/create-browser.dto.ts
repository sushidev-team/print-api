import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrowserDto {
    
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Define an url from which the pdf file should be created.'
    })
    url: String;

    @ApiProperty({
        required: false,
        description: 'If defined the file should be downloaded automatically with this name.'
    })
    filename: String;

    @ApiProperty({
        required: false,
        description: 'Wait if the pdf create file should be created before teh request is returned.'
    })
    @IsBoolean();
    postBackWait: boolean = true;

    @ApiProperty({
        required: false,
        description: 'Define an url to which the document should be send.'
    })
    postBackUrl: String;

    @ApiProperty({
        required: false,
        description: 'Define a request body which is required for the postback.'
    })
    postBackBody: Object;

    @ApiProperty({
        required: false,
        description: 'Define a token for the postback.'
    })
    token: String;

    @ApiProperty({
        required: false,
        description: 'If set to true the file will automatically deleted on the first request.'
    })
    @IsBoolean();
    autodelete: boolean = false;

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