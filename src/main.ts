import * as chalk from 'chalk';

import { Fuzzer } from './fuzzer/fuzzer';

function main() {
    let args = process.argv;
    if (args.length > 2) {
        // 0 = node
        // 1 = file being excuted, hence 2
        let fuzzer = new Fuzzer(args.slice(2))
    } else {
        console.log(chalk.red('Check your fuzz command arguments !!'))
        process.exit(-1);
    }
}

main();