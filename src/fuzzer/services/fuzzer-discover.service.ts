import { queue } from 'rxjs/scheduler/queue';
import { Observable } from 'rxjs/Rx';
import { requestGET, RequestResponse } from './fuzzer-request.service';
import { fuzzerAuthenticator } from './fuzzer-custom-auth.service';
import { DiscoverConfig, FuzzerConfig } from '../fuzzer.options';
import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as stream from 'stream';
import * as cheerio from 'cheerio';
import * as url from 'url';

export function fuzzerDiscover(config: DiscoverConfig) {
  let _res: RequestResponse;
  console.log(chalk.bgBlack.cyan.bold('Fuzzer Discover'))

  if (config['custom-auth']) {
    validateCommonWordsFile(config)
      .map(extractWords)
      .flatMap(fuzzerAuthenticator)
      .map(pageDiscovery)
      // .map(arr=>{return})
      .subscribe(res => {
        console.log(res.res.statusCode);
        pageDiscovery(res);
      }, err => { console.log(err) })

  } else {
    validateCommonWordsFile(config)
      .map(extractWords)
      .subscribe(config =>
        requestGET({ url: config.url }).subscribe(res => {
          console.log(res.res.statusMessage);
          pageDiscovery(res);
        }),
      err => { console.log(err) })
  }
}


function validateCommonWordsFile(config: DiscoverConfig): Observable<DiscoverConfig> {
  let commonWordsPath = path.resolve(config['common-words']);
  if (fs.existsSync(commonWordsPath)) {
    console.log(chalk.green.bgBlack.bold('found '.concat(commonWordsPath)));
    config.commonWordsFilePath = commonWordsPath;
    return Observable.of(config);
  } else {
    console.log(chalk.red.bgBlack.bold('404 not found : '.concat(commonWordsPath)));
    return Observable.throw(new Error('404'));
  }
}



function extractWords(config: DiscoverConfig): DiscoverConfig {
  //  let insteam = fs.createReadStream(config.commonWordsFilePath, {encoding: 'utf8'}).pipe(split())
  console.log(chalk.bgBlack.cyan('Extracting common words'));
  let content = fs.readFileSync(config.commonWordsFilePath).toString().split('\n');
  console.log(content);
  config.words = content;
  return config;
}



function pageDiscovery(res: RequestResponse) {
  console.log(chalk.bgBlack.bold.cyan('Page Discovery'));
  linkDiscovery(res.body);
  inputDiscovery(res.body);
  formDiscovery(res.body);
  // let $ = cheerio.load(body);
  return res;

}


function linkDiscovery(body: string) {
  console.log(chalk.bgBlack.green('Link Discovery'));
  let $ = cheerio.load(body);
  let links = $('a');
  console.log(chalk.yellow(`Discovered ${links.length} link(s)`));
  links.map((index, el) => {
    console.log(index);
    console.log(el.tagName);
    console.log($(el).html());
    console.log(el.attribs);
    parseUrl(el);
    console.log(chalk.yellow('------------------------------'));
  })
}
function inputDiscovery(body: string) {
  console.log(chalk.bgBlack.green('Input Discovery'));
  let $ = cheerio.load(body);
  let inputs = $('input');
  console.log(chalk.yellow(`Discovered ${inputs.length} input(s)`));
  inputs.map((index, el) => {
    console.log(el.tagName);
    console.log($(el).html());
    console.log(el.attribs);
    console.log(chalk.yellow('------------------------------'));
  })
}

function formDiscovery(body: string) {
  console.log(chalk.bgBlack.green('Form Discovery'));
  let $ = cheerio.load(body);
  let forms = $('form');
  console.log(chalk.yellow(`Discovered ${forms.length} form(s)`));
  forms.map((index, el) => {
    console.log(el.tagName);
    console.log($(el).html());
    console.log(el.attribs);
    let rawHTMLForm = $(el).html();
    inputDiscovery(rawHTMLForm);
    console.log(chalk.yellow('------------------------------'));
  })
}


function pageGuessing(body: string) {
  console.log(chalk.bgBlack.green('Page Guessing'));
  let $ = cheerio.load(body);
  let els = $('*');
  els.map((index, el) => { })
}

function parseUrl(el: CheerioElement) {
  console.log(chalk.magenta('Parsing URL'));
  if ((<any>el.attribs)['href']) {
    let href = url.parse((<any>el.attribs)['href']);
    console.log('Query string');
    console.log(href.query);
  }
}

function checkWordAgainstAttr(word: string, el: CheerioElement) {

}


function doesElemenetContainWord(word: string, el: CheerioElement) {
  let keys = Object.keys(el.attribs);
  let vals = Array<string>();
  keys.map(key => { vals.push((<any>el.attribs)[key]) });
  let itDoes = false;
  vals.map(val => {
    if (val === word) {
      itDoes = true;
    }
  })
  return itDoes;
}


