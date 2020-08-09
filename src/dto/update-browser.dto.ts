import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrowserDto {

    @ApiProperty({
        required: false,
        description: 'If defined the file should be downloaded automatically with this name.'
    })
    filename: String;
    
    @ApiProperty({
        required: false,
        description: 'If set to true the file will automatically deleted on the first request.'
    })
    @IsBoolean()
    autodelete: boolean = false;

    @ApiProperty({
        required: false,
        description: 'Mark if a document got printed.'
    })
    @IsBoolean()
    printed: boolean = false;

}