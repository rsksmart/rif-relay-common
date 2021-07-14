import { PrefixedHexString } from 'ethereumjs-tx';
export interface RelayData {
    gasPrice: string;
    domainSeparator: PrefixedHexString;
    relayWorker: string;
    callForwarder: string;
    callVerifier: string;
}
