import { fuzzerAuthenticator } from './fuzzer-custom-auth.service';
import { FuzzerConfig } from '../fuzzer.options';
import * as chalk from 'chalk';

export function fuzzerDiscover(config: FuzzerConfig) {
  console.log(chalk.bgBlack.cyan.bold('Fuzzer Discover'))
  if (config['custom-auth']) {
    fuzzerAuthenticator(config);
  }

}