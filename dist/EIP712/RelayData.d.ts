import { PrefixedHexString } from 'ethereumjs-tx';
export default interface EIP712RelayData {
    gasPrice: string;
    domainSeparator: PrefixedHexString;
    relayWorker: string;
    callForwarder: string;
    callVerifier: string;
}
