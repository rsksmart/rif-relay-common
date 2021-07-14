/**
 * We will need some mechanism to support different constants and algorithms for different networks.
 * So far the only conflict we will have is migration to Istanbul, as ETC does not integrate it as of this writing.
 * TODO: see the differences between networks we want to support and make project structure multi-chain
 */
import { RelayHubConfiguration } from './types/RelayHubConfiguration';
export interface Environment {
    readonly chainId: number;
    readonly mintxgascost: number;
    readonly relayHubConfiguration: RelayHubConfiguration;
}
export declare const environments: {
    [key: string]: Environment;
};
export declare const defaultEnvironment: Environment;
export declare function getEnvironment(networkName: string): Environment;
export declare function isRsk(environment: Environment): boolean;
