export type FuzzerCommand = 'test' | 'discover';

export interface FuzzerConfig {
    'custom-auth': string;
    command: FuzzerCommand
    url: string;
}

export interface DiscoverConfig extends FuzzerConfig {
    'commond-words': string;
}
export type DiscoverOption = keyof DiscoverConfig;

export interface TestConfig extends FuzzerConfig {
    vectors: string;
    sensitive: string;
    ramdom: boolean;
    slow: number;
}
export type TestOption = keyof TestConfig