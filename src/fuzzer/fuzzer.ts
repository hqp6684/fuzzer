import * as cheerio from 'cheerio';
import * as request from 'request';
import { Observable } from 'rxjs';
import { BrowserEmulator } from '../browser-emulator/emulator';


export class Fuzzer {
    private emulator: BrowserEmulator;
    constructor() {
        //    this.emulator = new BrowserEmulator(); 
    }
    private getRawHtml() {

    }
    getAllElements() {
        let url = 'https://hpham.co';
        request(url, {}, (err, res, body) => {
            if (!err) {
                // this.emulator = new BrowserEmulator(body);
                // console.log(this.emulator.getAllElements());
                // let document = this.emulator.getDocument();

                // console.log(document.getElementsByTagName('a'));
                let $ = cheerio.load(body);
                $('*').find('a').map((index, el) => {
                    console.log(el.parentNode);
                })

            }
        });

        // Observable.bindrequest.get('www.google.com');j
        // let x = Observable.bindCallback(request(url,{},(err,res,body)=>{

        // }));
    }
}