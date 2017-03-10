import { queue } from 'rxjs/scheduler/queue';
import { Observable } from 'rxjs/Rx';
import { CoreOptions, requestGET, RequestResponse } from './fuzzer-request.service';
import { fuzzerAuthenticator, printRes } from './fuzzer-custom-auth.service';
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
      .subscribe(res => {
        pageDiscovery(res);
        constructPageDiscoveryURLs(config);
        pageGuessor(config);
      }, err => { console.log(err) })

  } else {
    validateCommonWordsFile(config)
      .map(extractWords)
      .subscribe(config =>
        requestGET({ url: config.url }).subscribe(res => {
          console.log(res.res.statusMessage);
          pageDiscovery(res);
          constructPageDiscoveryURLs(config);
          pageGuessor(config);
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
  printLineBreak();
  printHeader('Link Discovery')
  let $ = cheerio.load(body);
  let links = $('a');
  console.log(chalk.yellow(`Discovered ${links.length} link(s)`));
  links.map((index, el) => {
    printHeader(`Link ${index + 1}`);
    console.log(el.tagName);
    console.log($(el).html());
    console.log(el.attribs);
    parseUrl(el);
    printFooter();
  })
}
export function inputDiscovery(body: string) {
  printLineBreak();
  printHeader('Input Discovery');
  let $ = cheerio.load(body);
  let inputs = $('input');
  printHeader(`Discovered ${inputs.length} input(s)`);
  inputs.map((index, el) => {
    printHeader(`Input ${index + 1}`)
    console.log(el.tagName);
    console.log($(el).html());
    console.log(el.attribs);
    printFooter();
  })
}

export function formDiscovery(body: string) {
  printLineBreak();
  printHeader('Form Discovery')
  let $ = cheerio.load(body);
  let forms = $('form');
  console.log(chalk.yellow(`Discovered ${forms.length} form(s)`));
  forms.map((index, el) => {
    printHeader(`Form ${index + 1}`);
    console.log(el.tagName);
    console.log(el.attribs);
    let rawHTMLForm = $(el).html();
    inputDiscovery(rawHTMLForm);
    printLineBreak();
  })
  printFooter();
  return forms;

}


function parseUrl(el: CheerioElement) {
  console.log(chalk.magenta('Parsing URL'));
  if ((<any>el.attribs)['href']) {
    let href = url.parse((<any>el.attribs)['href']);
    console.log('Query string');
    console.log(href.query);
  }
}



function constructPageDiscoveryURLs(config: DiscoverConfig): DiscoverConfig {
  let extensions = ['php', 'html', 'htm', 'jsp', 'asp'];
  let urls = Array<string>();


  let rawUrl = url.parse(config.url);
  let initialPath = rawUrl.pathname;


  if (config.words.length > 0) {
    let words = config.words;
    words
      .filter((val => val.length > 0))
      .map((word, index) => {

        if (rawUrl.pathname !== '/') {
          urls.push(url.resolve(config.url, path.join(rawUrl.pathname, word)));
        } else {
          urls.push(url.resolve(config.url, word));
        }
        extensions.map(extension => {
          urls.push(
            url.resolve(config.url, path.join(rawUrl.pathname, word.concat('.', extension)))
          )
        })
      })
    // console.log(urls);
  }
  config.potentialUrls = urls;
  return config;
}

function pageGuessor(config: DiscoverConfig, header?: any) {
  if (!config.potentialUrls) return;
  config.potentialUrls.map(potentialUrl => {
    let options: CoreOptions = { url: potentialUrl };

    if (header) {
      options.headers = { 'Cookie': header };
    }
    requestGET(options)
      .subscribe(res => {
        printRes(res, potentialUrl);
        if (res.res.statusCode !== 404)
          pageDiscovery(res);
      })

  })
  return config;
}




export function printHeader(header: string) {
  console.log(chalk.bgBlack.cyan.bold(`-----------------------------------==== ${header} ====-----------------------------------`));
}
export function printFooter() {
  console.log(`-----------------------------------==== END ====-----------------------------------`)
}
export function printLineBreak() {
  console.log('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
}