import type { LogLevelNumbers } from 'loglevel';

/**
 * @field methodSuffix - allows use of versioned methods, i.e. 'eth_signTypedData_v4'. Should be '_v4' for Metamask
 * @field jsonStringifyRequest - should be 'true' for Metamask, false for ganache
 */
export interface EnvelopingConfig {
  preferredRelays: string[];
  onlyPreferredRelays: boolean;
  relayLookupWindowBlocks: number;
  relayLookupWindowParts: number;
  methodSuffix: string;
  jsonStringifyRequest: boolean;
  relayTimeoutGrace: number;
  sliceSize: number;
  logLevel: LogLevelNumbers;
  gasPriceFactorPercent: number;
  minGasPrice: number;
  maxRelayNonceGap: number;
  relayHubAddress: string;
  deployVerifierAddress: string;
  relayVerifierAddress: string;
  forwarderAddress: string;
  smartWalletFactoryAddress: string;
  chainId: number;
  clientId: string;
}
