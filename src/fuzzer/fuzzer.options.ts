export type FuzzerCommand = 'test' | 'discover';

export interface FuzzerConfig {
    // optional option
    'custom-auth'?: string;
    command: FuzzerCommand
    url: string;
}
export type FuzzerOption = keyof FuzzerConfig;

export interface DiscoverConfig extends FuzzerConfig {
    /**
     * --common-words=file 
     * Newline-delimited file of common words to be used in page guessing and input guessing. Required
     */
    'common-words': string;
    commonWordsFilePath?: string;
    words?: string[];
    potentialUrls?: string[];


}
export type DiscoverOption = keyof DiscoverConfig;

export interface TestConfig extends FuzzerConfig {
    /**
     * --vectors=file         
     * Newline-delimited file of common exploits to vulnerabilities. Required.
     */
    vectors: string;
    vectorsFilePath?: string;
    vectorArray?: Array<string>;

    /**
     *--sensitive=file 
     * Newline-delimited file data that should never be leaked. It's assumed that
     * this data is in the application's database (e.g. test data), but is not 
     * reported in any response. Required.
     */
    sensitive: string;
    sensitiveFilePath?: string;
    sensitiveArray?: string[];
    /**
     * --random=[true|false]  
     * When off, try each input to each page systematically.  
     * When on, choose a random page, then a random input field and test all vectors. Default: false. 
     */
    random: boolean;
    /**
     *--slow=500             
     * Number of milliseconds considered when a response is considered "slow". Default is 500 milliseconds
     */
    slow: number;
}
export type TestOption = keyof TestConfig