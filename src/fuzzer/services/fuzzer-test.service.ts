import { CoreOptions, requestGET, RequestResponse } from './fuzzer-request.service';
import { fuzzerAuthenticator } from './fuzzer-custom-auth.service';
import { FuzzerConfig, TestConfig } from '../fuzzer.options';
import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';

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

      })
    // .subscribe(config => {
    //   validateSensitiveFile(config)
    //     .map(extractSensitive);
    // })

  } else {
    validateVectorsFile(config)
      .map(extractVectors)
      .subscribe(config => {
        validateSensitiveFile(config).map(extractSensitive);
      })

  }
  /**
   * 
   * @param config TestConfig
   * @param customAuthRes response contains cookie
   */
  function getBody(config: TestConfig, customAuthRes?: RequestResponse) {

    let requestConfig: CoreOptions = { url: config.url };
    if (customAuthRes) {
      requestConfig = { url: config.url, headers: { 'Cookie': customAuthRes.cookie } };
      requestGET(requestConfig).subscribe(res => {
        console.log(res.body);
      })
    } else {
      requestGET(requestConfig).subscribe(res => {
        console.log(res.body);
      })

    }

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

