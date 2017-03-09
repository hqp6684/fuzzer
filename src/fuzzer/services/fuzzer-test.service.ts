import { fuzzerAuthenticator } from './fuzzer-custom-auth.service';
import { FuzzerConfig, TestConfig } from '../fuzzer.options';
import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';

export function fuzzerTest(config: FuzzerConfig) {

  console.log(chalk.bgBlack.cyan.bold('Fuzzer Test '));
  if (config['custom-auth']) {
    fuzzerAuthenticator(config);
  } else {

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

  function validateSensitiveFile(config: TestConfig): Observable<TestConfig> {
    let sensitiveFilePath = path.resolve(config['sensitive']);
    if (fs.existsSync(sensitiveFilePath)) {
      console.log(chalk.green.bgBlack.bold('found '.concat(sensitiveFilePath)));
      config.vectorsFilePath = sensitiveFilePath;
      return Observable.of(config);
    } else {
      console.log(chalk.red.bgBlack.bold('404 not found : '.concat(sensitiveFilePath)));
      return Observable.throw(new Error('404'));
    }
  }


}

