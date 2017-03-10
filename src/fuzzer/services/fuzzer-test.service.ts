import { formDiscovery, printHeader, printLineBreak } from './fuzzer-discover.service';
import { AsyncSubject } from 'rxjs/Rx';
import { CoreOptions, requestGET, RequestResponse } from './fuzzer-request.service';
import { fuzzerAuthenticator, printRes } from './fuzzer-custom-auth.service';
import { FuzzerConfig, TestConfig } from '../fuzzer.options';
import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as url from 'url';
import * as querystring from 'querystring';
import * as cheerio from 'cheerio';

export function fuzzerTest(config: TestConfig) {

  console.log(chalk.bgBlack.cyan.bold('Fuzzer Test '));
  if (config['custom-auth']) {
    // fuzzerAuthenticator(config)
    validateVectorsFile(config)
      .map(extractVectors)
      .flatMap(validateSensitiveFile)
      .map(extractSensitive)
      .flatMap(fuzzerAuthenticator)
      .subscribe(res => {
        runTest(config, res);

      })
    // .subscribe(config => {
    //   validateSensitiveFile(config)
    //     .map(extractSensitive);
    // })

  } else {
    validateVectorsFile(config)
      .map(extractVectors)
      .flatMap(validateSensitiveFile)
      .map(extractSensitive)
      .subscribe(_config => {
        runTest(_config);

      })

  }


  function runTest(config: TestConfig, res?: RequestResponse) {
    if (res) {
      getBody(config, res).subscribe(body => {
        testForms(config, body, res);


      })

    } else {
      getBody(config).subscribe(body => {
        testForms(config, body);

      })
    }

  }


  function testForms(config: TestConfig, body: string, resWithCookie?: RequestResponse) {
    let $ = cheerio.load(body);
    let forms = $('form');
    forms.map((index, form) => {
      printHeader(`FORM ${index}`)
      console.log($(form).html());
      printHeader('--');
      if (resWithCookie) {

        testVector(config, $, form, index, resWithCookie);
      } else {

        testVector(config, $, form, index);
      }
    });

  }

  function testVector(config: TestConfig, $: CheerioStatic, form: CheerioElement, formIndex: number, resWithCookie?: RequestResponse) {
    config.vectorArray.map((vector, index) => {
      let queryString = generateQueryString($, form, vector);
      let time = 0;
      let start = timer();
      if (resWithCookie) {
        testFormMethodGET(config, queryString, resWithCookie)
          .subscribe(res => {
            time += timer() - start;
            let thisTaskTime = howLong(time);
            printHeader(`VECTOR ${index} = ${vector}  `);
            printRes(res, queryString, false, thisTaskTime);
            checkSanitization(config, res, queryString, formIndex, vector);
            checkSensitive(config, res);
            printLineBreak();
          })
      } else {
        testFormMethodGET(config, queryString)
          .subscribe(res => {
            time += timer() - start;
            let thisTaskTime = howLong(time);
            printHeader(`VECTOR ${index} = ${vector}  `);
            printRes(res, queryString, false, thisTaskTime);
            checkSanitization(config, res, queryString, formIndex, vector);
            checkSensitive(config, res);
            printLineBreak();

          })

      }

    })
  }

  function generateQueryString($: CheerioStatic, form: CheerioElement, vector?: string, printAfter?: boolean) {
    let values = Array<string>();
    $(form).find('input').map((index, el) => {
      if ($(el).attr('value')) {
        values.push($(el).attr('name').concat('=', $(el).attr('value')));
      } else {
        if (vector) {
          values.push($(el).attr('name').concat('=', vector));
        }

      }
    });
    let queryString = '?'.concat(values.join('&'));
    return queryString;

  }
  function testFormMethodGET(config: TestConfig, queryString: string, resWithCookie?: RequestResponse) {
    if (resWithCookie) {
      return requestGET({ url: config.url.concat(queryString), headers: { 'Cookie': resWithCookie.cookie } })
    }
    return requestGET({ url: config.url.concat(queryString) });
  }

  function testFormMethodPOST() {

  }

  function checkSanitization(config: TestConfig, res: RequestResponse, originalQueryString: string, formIndex: number, vector: string) {
    console.log('CHECK SANITIZATION')
    let $ = cheerio.load(res.body);
    let forms = $('form').map((index, form) => {
      if (index === formIndex) {
        printHeader('Query String Before');
        console.log(originalQueryString);
        // console.log(url.parse(originalQueryString))
        console.log('Returned Form');
        console.log($(form).html());
        printHeader('Query String After');
        let afterQueryString = generateQueryString($, form);
        console.log(afterQueryString);
        console.log(`Index of vector is : ${afterQueryString.indexOf(vector)}`)

      }
    })



  }
  function checkSensitive(config: TestConfig, res: RequestResponse) {
    console.log('CHECK SENSITIVE DATA')
    config.sensitiveArray.map((value, index) => {
      printHeader(`Sensitive Data ${index} = ${value}`);
      let lines: string[] = [];
      res.body.split('\n').map((line) => {
        if (line.indexOf(value) > -1) {
          lines.push(line);
        }
      })
      if (lines.length > 0) {
        console.log(`Found ${lines.length} line(s)`)
        lines.map(line => { console.log(line) });
      } else {
        console.log('No sensitive data found');
      }
    })

  }


  let timer = Date.now.bind(Date);
  function howLong(time: number) {
    return (Math.floor(time * 100) / 100) + 'ms';
  }
















  /**
   * 
   * @param config TestConfig
   * @param customAuthRes response contains cookie
   */
  function getBody(config: TestConfig, customAuthRes?: RequestResponse): Observable<string> {
    let body = new AsyncSubject<string>();

    let requestConfig: CoreOptions = { url: config.url };
    if (customAuthRes) {
      requestConfig = { url: config.url, headers: { 'Cookie': customAuthRes.cookie } };
      requestGET(requestConfig).subscribe(res => {
        // console.log(res.body);
        body.next(res.body);
        body.complete();
      })
    } else {
      requestGET(requestConfig).subscribe(res => {
        // console.log(res.body);
        body.next(res.body);
        body.complete();
      })

    }
    return body;

  }










  function validateVectorsFile(config: TestConfig): Observable<TestConfig> {
    let vectorsPath = path.resolve(config['vectors']);
    if (fs.existsSync(vectorsPath)) {
      console.log(chalk.green.bgBlack.bold('found '.concat(vectorsPath)));
      config.vectorsFilePath = vectorsPath;
      return Observable.of(config);
    } else {
      console.log(chalk.red.bgBlack.bold('404 not found : '.concat(vectorsPath)));
      return Observable.throw(new Error('404'));
    }
  }

  function extractVectors(config: TestConfig) {
    console.log(chalk.bgBlack.cyan('Extracting vectors from input'));
    let content = fs.readFileSync(config.vectorsFilePath).toString().split('\n');
    console.log(content);
    config.vectorArray = content;
    return config;
  }


  function validateSensitiveFile(config: TestConfig): Observable<TestConfig> {
    let sensitiveFilePath = path.resolve(config['sensitive']);
    if (fs.existsSync(sensitiveFilePath)) {
      console.log(chalk.green.bgBlack.bold('found '.concat(sensitiveFilePath)));
      config.sensitiveFilePath = sensitiveFilePath;
      return Observable.of(config);
    } else {
      console.log(chalk.red.bgBlack.bold('404 not found : '.concat(sensitiveFilePath)));
      return Observable.throw(new Error('404'));
    }
  }
  function extractSensitive(config: TestConfig) {
    console.log(chalk.bgBlack.cyan('Extracting vectors from input'));
    let content = fs.readFileSync(config.sensitiveFilePath).toString().split('\n');
    console.log(content);
    config.sensitiveArray = content;
    return config;
  }


}

