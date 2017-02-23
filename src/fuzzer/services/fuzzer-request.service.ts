import * as chalk from 'chalk';
import { Observable } from 'rxjs/Rx';
import * as request from 'request';


export function urlIsValid(url: string): Observable<boolean> {
  let observable = Observable.bindCallback(request.get)

  let result = observable({ url: url })
    .map((result) => {
      if (result instanceof Error) {
        raiseRequestError(result);
        return false;
      }

      let res: request.RequestResponse = result[1];
      let body: string = result[2]
      console.log(chalk.bold.yellow('Request Method'));
      console.log(res.request.method);
      console.log(chalk.bold.yellow('Request Port'));
      console.log(res.request.port);
      console.log(chalk.bold.yellow('Request Url'));
      console.log(url);
      console.log(chalk.bold.yellow('Response Headers'));
      console.log(res.headers);
      console.log(chalk.bold.yellow('Response Status Code'));
      console.log(res.statusCode);
      console.log(chalk.bold.yellow('Response Status Message'));
      console.log(res.statusMessage);
      return true;

    })
  return result
}

function raiseRequestError(err: any) {
  console.log(chalk.red.bold('Error at Request'));
  console.log(err);
  // process.exit(-1);
}

function mapRequesResponse(result: any): RequestResponse {
  let err: Error;
  let res: request.RequestResponse;
  let body: string;
  let observableReturn: RequestResponse;

  if (result instanceof Error) {
    raiseRequestError(result);
  }
  return observableReturn = { err: result, res: result[1], body: result[2] };
}

export function requestGET(options: CoreOptions): Observable<RequestResponse> {
  let obs = Observable.bindCallback(request.get);
  return obs(options).map(mapRequesResponse);
}

export function requestPOST(options: CoreOptions): Observable<RequestResponse> {
  let obs = Observable.bindCallback(request.post);
  // opts.url = 'sadf';
  return obs(options).map(mapRequesResponse);
}

export interface RequestResponse {
  err: Error;
  res: request.RequestResponse;
  body: string;
  cookie?: string;
}

export interface CoreOptions extends request.CoreOptions {
  url: string;
}