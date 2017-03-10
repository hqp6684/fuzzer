import { formDiscovery, printHeader } from './fuzzer-discover.service';
import { AsyncSubject } from 'rxjs/Rx';
import { CoreOptions, requestGET, RequestResponse } from './fuzzer-request.service';
import { fuzzerAuthenticator, printRes } from './fuzzer-custom-auth.service';
import { FuzzerConfig, TestConfig } from '../fuzzer.options';
import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';
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
      printHeader(`VECTOR ${index} = ${vector}  `);
      let queryString = generateQueryString($, form);
      let time = 0;
      let start = timer();
      if (resWithCookie) {
        testFormMethodGET(config, queryString, resWithCookie)
          .subscribe(res => {
            time += timer() - start;
            let thisTaskTime = howLong(time);
            printRes(res, queryString, false, thisTaskTime);
            checkSanitization(config, res, queryString, formIndex, vector);
            checkSensitive();
          })
      } else {
        testFormMethodGET(config, queryString)
          .subscribe(res => {
            time += timer() - start;
            let thisTaskTime = howLong(time);
            printRes(res, queryString, false, thisTaskTime);
            checkSensitive();
            checkSensitive();

          })

      }

    })
  }

  function generateQueryString($: CheerioStatic, form: CheerioElement) {
    let values = Array<string>();
    $(form).find('input').map((index, el) => {
      if ($(el).attr('value')) {
        values.push($(el).attr('name').concat('=', $(el).attr('value')));
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
    let forms = $('form').map((index, el) => {
      if (index === formIndex) {
        printHeader('BEFORE');
        console.log(originalQueryString);
        printHeader('AFTER');
        console.log(generateQueryString($, el))
        console.log(`Index of vector is : ${originalQueryString.indexOf(vector)}`)
      }
    })



  }
  function checkSensitive() {
    console.log('TODO SENSITIVE')

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

