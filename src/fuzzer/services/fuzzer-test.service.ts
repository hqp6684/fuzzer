import { fuzzerAuthenticator } from './fuzzer-custom-auth.service';
import { FuzzerConfig } from '../fuzzer.options';
import * as chalk from 'chalk'

export function fuzzerTest(config: FuzzerConfig) {

  console.log(chalk.bgBlack.cyan.bold('Fuzzer Test '));
  if (config['custom-auth']) {
    fuzzerAuthenticator(config);
  }

}

