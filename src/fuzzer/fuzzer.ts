import { AsyncSubject } from 'rxjs/Rx';
import { FuzzerConfig } from './fuzzer.options';
import { requestGET, urlIsValid } from './services/fuzzer-request.service';
import { FuzzerInputService } from './services/fuzzer-input.service';
//https://github.com/cheeriojs/cheerio
import * as cheerio from 'cheerio';
// https://github.com/request/request
import * as request from 'request';
import * as chalk from 'chalk';

import * as fs from 'fs';
import { Observable } from 'rxjs';


export class Fuzzer {

    private fuzzerInputService: FuzzerInputService;
    private config: FuzzerConfig;
    // make sure url is valid before proceeding 
    public urlIsValid = new AsyncSubject<boolean>();

    constructor(args: string[]) {
        // process input from ci
        this.fuzzerInputService = new FuzzerInputService(args);
        // get  config generated from service based  on input
        this.config = this.fuzzerInputService.getConfig();
        urlIsValid(this.config.url).subscribe(isValid => {
            if (isValid) {
                this.urlIsValid.next(isValid);
                this.urlIsValid.complete()
                console.log(chalk.bold.green(`URL is valid \n Continue`));
                this.whatNext();
            } else {
                // either quit -> re-enter input  OR keep process alive, ask for new input
                // quit for now
                process.exit(-1);
            }
        });

    }

    whatNext() {

        this.urlIsValid.subscribe(isValid => {
            // TODO, check custom-auth
            if (isValid) {
                // TODO delete this, this is a test
                // requestGET({ url: this.config.url }).subscribe(res => {
                // console.log(res.body)
                // })

                this.loginDvwa();

            }
        })
    }

    getAllElements() {
        // this.urlIsValid.subscribe(is)
        let url = 'http://127.0.0.1/dvwa';
        request(url, {}, (err, res, body) => {
            if (!err) {
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