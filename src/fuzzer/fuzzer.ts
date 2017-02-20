import { fuzzerDiscover } from './services/fuzzer-discover.service';
import { fuzzerTest } from './services/fuzzer-test.service';
import { isEmpty } from 'rxjs/operator/isEmpty';
import { AsyncSubject } from 'rxjs/Rx';
import { FuzzerConfig, FuzzerOption } from './fuzzer.options';
import { requestGET, requestPOST, urlIsValid } from './services/fuzzer-request.service';
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
        switch (this.config.command) {
            case 'test':
                fuzzerTest(this.config);
                break;
            case 'discover':
                fuzzerDiscover(this.config);
                break;
        }

    }
    /**
     * Return all non-empty elements 
     */
    getAllElementsAttribs() {
        let cheerioEls = Array<CheerioElement>();
        let req = requestGET({ url: this.config.url })
            .subscribe(res => {
                let $ = cheerio.load(res.body);
                console.log(chalk.bold.bgBlack.cyan(`Printing all elements and their attributes from GET ${chalk.yellow(this.config.url)}`));
                $('*').map((index, el) => {
                    if (Object.keys(el.attribs).length > 0) {
                        console.log(`${chalk.green(el.tagName)}`);
                        console.log(el.attribs);
                    }
                });
            })
    }

}