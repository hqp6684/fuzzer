import * as chalk from 'chalk';

import { Fuzzer } from './fuzzer/fuzzer';

function main() {
    let args = process.argv;
    // 0 = node
    // 1 = file being excuted
    // 2 = fuzz command 'test' || 'discover'
    // 3 = url
    // 4+ = options
    if (args.length >= 4) {
        // cut off first 2 arguments
        // this fuzzer only needs the rest
        let fuzzer = new Fuzzer(args.slice(2))
    } else {
        console.log(chalk.red('Check your fuzz command arguments !!'))
        process.exit(-1);
    }
}

main();