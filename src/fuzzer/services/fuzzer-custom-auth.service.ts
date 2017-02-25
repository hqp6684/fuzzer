import { Observable } from 'rxjs/Rx';
import { Cookie } from 'request';
import { FuzzerConfig } from '../fuzzer.options';
import * as url from 'url';
// import {Url} from 'url'
import * as path from 'path';
import * as chalk from 'chalk';
import * as cheerio from 'cheerio';
import { requestGET, requestPOST, RequestResponse, CoreOptions } from './fuzzer-request.service';



export function fuzzerAuthenticator(config: FuzzerConfig): Observable<RequestResponse> {
  switch (config['custom-auth']) {
    case 'dvwa':
      return dvwaAuth(config);
    default:
      break;
  }
}


function dvwaAuth(config: FuzzerConfig) {
  console.log(chalk.bgBlack.cyan.bold('DVWA Custom Authentication'));

  let postTargetFile = './login.php';
  // this is hard-coded,
  // TODO: get this path from response header after post credential response headers['location']
  let indexAfterPostCredentialTargetFile = './index.php';

  let configURL = url.parse(config.url);
  let basePath = configURL.pathname;
  let postTargetPath = path.resolve(basePath, postTargetFile);
  // path to get inddex file after login
  let indexAfterPostCredentialTargetPath = path.resolve(basePath, indexAfterPostCredentialTargetFile);

  let postURL = url.resolve(config.url, postTargetPath);
  let getURL = url.resolve(config.url, indexAfterPostCredentialTargetPath);
  // console.log(postURL);

  let cookieHeader;

  return requestGET({ url: postURL })
    .flatMap(res => postCredential(postURL, res))
    .flatMap(cookie => getIndexAfterPostCredential(getURL, cookie))
  // .subscribe(res => {
  //   console.log(chalk.bgBlack.cyan.bold('Finish'));

  // })



}

function getCookie(res: RequestResponse): Array<string> {

  // printRes(res);
  console.log(chalk.bgBlack.cyan.bold('Looking for Set-Cookie Header'));
  // extract cookie
  let headerKeys = Object.keys(res.res.headers);
  let cookieHeaderKeys = headerKeys.filter(header => new RegExp('cookie', 'g').test(header));
  let cookieHeader = res.res.headers[cookieHeaderKeys[0]];
  console.log(chalk.yellow(cookieHeader));
  return cookieHeader;
}

function extractCookieHeader(header: Array<String>) {
  console.log(chalk.bgBlack.cyan.bold('Extracting Set-Cookie Header'));
  let sid: string;
  let security: string;
  header.map(value => {
    let subStrings = value.split(';');
    subStrings.map(subString => {
      if (subString.toLowerCase().indexOf('sessid') >= 0) {
        sid = subString;
      }
      if (subString.toLowerCase().indexOf('security') >= 0) {
        security = subString
      }
    })
  })
  let cookieHeader = [security, sid].join('; ')

  console.log(chalk.yellow(cookieHeader));
  return cookieHeader;
}

function postCredential(postURL: string, res: RequestResponse) {
  // security level = impossible
  let user_token: string;
  let $ = cheerio.load(res.body);
  let inputs = $('form').find('input').map((index, input) => {
    let name = $(input).attr('name');
    // console.log(nameValue);
    name === 'user_token' ? user_token = $(input).attr('value') : user_token = undefined;
  })

  let cookieHeader = extractCookieHeader(getCookie(res));
  let form = { 'username': 'admin', 'password': 'password', 'Login': 'Login' };
  if (user_token) {
    (<any>form)['user_token'] = user_token;
  }
  console.log(form);

  return requestPOST({
    url: postURL,
    form: form,
    headers: { 'Cookie': cookieHeader }
  })
    .map(res => {
      printRes(res, postURL);
      return cookieHeader;
    })

}

function getIndexAfterPostCredential(url: string, cookieHeader: string) {
  return requestGET({ url: url, headers: { 'Cookie': cookieHeader } })
    .map(res => {
      printRes(res, url, true);
      res.cookie = cookieHeader;
      return res;
    })
}

export function printRes(res: RequestResponse, url?: string, loggedIn?: boolean) {
  if (url) {
    console.log(chalk.bgBlack.bold.green('----------====== URL ======----------'));
    console.log(chalk.blue(url));
  }
  console.log(chalk.green('Request Method'));
  console.log(res.res.request.method);
  console.log(chalk.green('Request Headers'));
  console.log(res.res.request.headers);
  console.log(chalk.green('Request Response Headers'));
  console.log(res.res.headers);
  console.log(chalk.green('Request Response Status Code'));
  console.log(res.res.statusCode);
  console.log(chalk.green('Request Response Status Message'));
  console.log(res.res.statusMessage);
  console.log(chalk.bold.bgBlack.cyan('Response Body'));
  // console.log(res.body);
  if (loggedIn) {
    console.log(chalk.bgBlack.green.bold(
      cheerio.load(res.body)('.message').html()
    ))
  }
}