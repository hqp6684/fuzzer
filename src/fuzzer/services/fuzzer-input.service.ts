import { range } from 'rxjs/observable/range';
import * as chalk from 'chalk';
import { DiscoverConfig, FuzzerCommand, FuzzerConfig, FuzzerOption, TestConfig } from '../fuzzer.options';
import { Observable } from 'rxjs/Rx';


export class FuzzerInputService {

  private fuzzerConfig: FuzzerConfig;
  private fuzzerTestConfig: TestConfig;
  private fuzzerDiscoverConfig: DiscoverConfig;

  /**
   * @arg args : input from command line
   */
  constructor(private args: string[]) {
    this.initFuzzerConfig();
  };


  getConfig(): FuzzerConfig {
    return this.fuzzerConfig;
  }
  getTestConfig(): TestConfig {
    return this.fuzzerTestConfig;
  }
  getDiscoverConfig(): DiscoverConfig {
    return this.fuzzerDiscoverConfig;
  }

  /**
   * Initialize a configuration for fuzzer
   */
  private initFuzzerConfig() {
    // 0 = fuzzer command
    // 1 = url
    // this.args.length should alwasy be >= 2
    let command = <FuzzerCommand>this.args[0];
    let url: string = this.args[1];

    switch (command) {
      case 'test':
        this.fuzzerTestConfig = {
          'custom-auth': '',
          command: command,
          url: url,
          sensitive: '',
          vectors: '',
          random: false,
          slow: 500
        }
        this.fuzzerConfig = this.fuzzerTestConfig;
        break;
      case 'discover':
        this.fuzzerDiscoverConfig = {
          'custom-auth': '',
          command: command,
          url: url,
          'common-words': ''
        }
        this.fuzzerConfig = this.fuzzerDiscoverConfig;
        break;
      default:
        raiseInputError(`Error: command '${command}' is invalid ! Only accept 'test' or 'discover'`);
    }

    this.extractArgsAndSetOptions(this.fuzzerConfig);
  }

  /**
   * Extract input from command line, check if they're valid and then 
   * overwrite the default value
   */
  private extractArgsAndSetOptions(config: FuzzerConfig) {
    let keyValuePairRegex = /(?!-+).+/g
    let rawOptions = this.args.slice(2);
    rawOptions.map(rawOpt => {
      // match return array of items that match regex
      // split key value using = sign, which also return an array 
      let kv = rawOpt.match(keyValuePairRegex)[0].split('=');
      let key = <FuzzerOption>kv[0];
      let value = kv[1];

      let property = getProperty(config, key);


      if (property !== undefined) {
        setProperty(config, key, value);
      } else {
        raiseInputError(rawOpt);
      }
    })
    console.log(chalk.bold.yellow(`Entered :`));
    console.log(config);
  }



}

export function raiseInputError(message?: string) {
  let _message = 'Error: invalid input';
  console.log(chalk.red(message ? _message.concat('\n', message) : _message));
  process.exit(-1)
}

/**
 * Generic get property of an object, need typescipt >=2.1
 */
export function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];  // Inferred type is T[K]
}


export function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value;
}
