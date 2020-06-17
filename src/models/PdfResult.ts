export class PdfResult {

    public statusCode:number = 0;
    public requestUrl:string;
    public downloadUrl:string;
    public filename:String;
    public uploaded:boolean;

    constructor(
        data: Object
    ){
        Object.assign(this, data);
    }
  }