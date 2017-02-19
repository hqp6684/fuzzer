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

}