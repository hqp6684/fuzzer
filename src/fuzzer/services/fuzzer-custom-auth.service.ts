import { Cookie } from 'request';
import { FuzzerConfig } from '../fuzzer.options';
import * as url from 'url';
// import {Url} from 'url'
import * as path from 'path';
import * as chalk from 'chalk';
import { requestGET, requestPOST, RequestResponse } from './fuzzer-request.service';



export function fuzzerAuthenticator(config: FuzzerConfig) {
  switch (config['custom-auth']) {
    case 'dvwa':
      dvwaAuth(config);
      break;
  }
}


function dvwaAuth(config: FuzzerConfig) {
  let postTargetFile = './login.php';

  let configURL = url.parse(config.url);
  let basePath = configURL.pathname;
  let postTargetPath = path.resolve(basePath, postTargetFile);

  let postURL = url.resolve(config.url, postTargetPath);
  console.log(postURL);

  requestGET({ url: config.url })
    .map(getCookie)
    .filter(header => header ? true : false)
    .map(extractCookieHeader)
    // .flatMap(requestPOST())
    .subscribe(cookieHeader => {
      // let cookieHeader = extractCookieHeader(rawSetCookie);
      console.log(cookieHeader);

      requestPOST({
        url: postURL,
        form: { 'username': 'admin', 'password': 'password', 'Login': 'Login' },
        headers: { 'Cookie': cookieHeader }

      }).subscribe(res => {
        console.log(chalk.green('Request Headers'));
        console.log(res.res.request.headers);
        console.log(chalk.green('Request Response Headers'));
        console.log(res.res.headers);

      })

    })



}

function getCookie(res: RequestResponse): Array<string> {

  // extract cookie
  let setCookie = res.res.headers['Set-Cookie']
  let headerKeys = Object.keys(res.res.headers);
  let cookieHeaderKeys = headerKeys.filter(header => new RegExp('cookie', 'g').test(header));
  let cookieHeader = res.res.headers[cookieHeaderKeys[0]];
  return cookieHeader;
}

function extractCookieHeader(header: Array<String>) {
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

  return cookieHeader;
}


export interface CookieHeader {

}