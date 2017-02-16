//https://github.com/cheeriojs/cheerio
import * as cheerio from 'cheerio';
// https://github.com/request/request
import * as request from 'request';

import * as fs from 'fs';
import { Observable } from 'rxjs';
import { BrowserEmulator } from '../browser-emulator/emulator';


export class Fuzzer {
    private emulator: BrowserEmulator;
    constructor(args: string[]) {
        //    this.emulator = new BrowserEmulator(); 
    }
    private getRawHtml() {

    }
    getAllElements() {
        let url = 'http://127.0.0.1/dvwa';
        request(url, {}, (err, res, body) => {
            if (!err) {
                // this.emulator = new BrowserEmulator(body);
                // console.log(this.emulator.getAllElements());
                // let document = this.emulator.getDocument();

                // console.log(document.getElementsByTagName('a'));
                let $ = cheerio.load(body);
                $('*').find('input').map((index, el) => {
                    // console.log(el.parentNode);
                    console.log(el);
                })

            }
        });

        // Observable.bindrequest.get('www.google.com');j
        // let x = Observable.bindCallback(request(url,{},(err,res,body)=>{

        // }));
    }

    loginDvwa() {
        let url = 'http://127.0.0.1/dvwa/login.php';
        request.post(url, { form: { 'username': 'admin', 'password': 'password', 'Login': 'Login' } }, (err, res, body) => {
            console.log(res.headers['set-cookie']);
            let setCookie = res.headers['set-cookie'];
            let securityLevel = setCookie[1];
            let phpSessID: string = setCookie[0].split(';')[0];

            let cookie: string = [securityLevel, phpSessID].join(';');
            console.log(cookie);
            // console.log(body);
            fs.writeFileSync('./data.json', JSON.stringify(res, null, 2), 'utf-8');
            request.get('http://127.0.0.1/dvwa/index.php', { headers: { 'Cookie': cookie } }, (err, res, body) => {
                console.log(body);
            })
        })
    }

}