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

  requestPOST({
    url: postURL,
    form: { 'username': 'admin', 'password': 'password', 'Login': 'Login' }
  }).subscribe(res => {
    // console.log(res.res.headers);
    getCookie(res);
  })


}

function getCookie(res: RequestResponse) {
  console.log(res);
  console.log(res.res.headers);
  // extract cookie
  let setCookie = res.res.headers['Set-Cookie']
  let headerKeys = Object.keys(res.res.headers);
  let cookieHeaders = headerKeys.filter(header => new RegExp('cookie', 'g').test(header));
  console.log(cookieHeaders);

}