// import * as cheerio from 'cheerio';
// import {CheerioStatic} from 'cheerio';

export class BrowserEmulator {
    private $: CheerioStatic;
    private domParser: DOMParser;
    constructor(private rawHtml: string) {
        this.$ = cheerio.load(rawHtml);
    }

    getAllElements() {
        let els = cheerio('*')
        let htmlEls: [HTMLElement];

        // els.map(el => {
        //     // els[el]
        // });

    }




}
