import { PrefixedHexString } from 'ethereumjs-tx';
import { DeployRequest, RelayRequest } from '../EIP712/RelayRequest';
export interface RelayMetadata {
    relayHubAddress: string;
    relayMaxNonce: number;
    signature: PrefixedHexString;
}
export interface RelayTransactionRequest {
    relayRequest: RelayRequest;
    metadata: RelayMetadata;
}
export interface DeployTransactionRequest {
    relayRequest: DeployRequest;
    metadata: RelayMetadata;
}
export declare const DeployTransactionRequestShape: {
    relayRequest: {
        request: {
            relayHub: import("ow").StringPredicate;
            from: import("ow").StringPredicate;
            to: import("ow").StringPredicate;
            value: import("ow").StringPredicate;
            nonce: import("ow").StringPredicate;
            data: import("ow").StringPredicate;
            tokenContract: import("ow").StringPredicate;
            tokenAmount: import("ow").StringPredicate;
            tokenGas: import("ow").StringPredicate;
            recoverer: import("ow").StringPredicate;
            index: import("ow").StringPredicate;
        };
        relayData: {
            gasPrice: import("ow").StringPredicate;
            domainSeparator: import("ow").StringPredicate;
            relayWorker: import("ow").StringPredicate;
            callForwarder: import("ow").StringPredicate;
            callVerifier: import("ow").StringPredicate;
        };
    };
    metadata: {
        relayHubAddress: import("ow").StringPredicate;
        relayMaxNonce: import("ow").NumberPredicate;
        signature: import("ow").StringPredicate;
    };
};
export declare const RelayTransactionRequestShape: {
    relayRequest: {
        request: {
            relayHub: import("ow").StringPredicate;
            from: import("ow").StringPredicate;
            to: import("ow").StringPredicate;
            value: import("ow").StringPredicate;
            gas: import("ow").StringPredicate;
            nonce: import("ow").StringPredicate;
            data: import("ow").StringPredicate;
            tokenContract: import("ow").StringPredicate;
            collectorContract: import("ow").StringPredicate;
            tokenAmount: import("ow").StringPredicate;
            tokenGas: import("ow").StringPredicate;
        };
        relayData: {
            gasPrice: import("ow").StringPredicate;
            domainSeparator: import("ow").StringPredicate;
            relayWorker: import("ow").StringPredicate;
            callForwarder: import("ow").StringPredicate;
            callVerifier: import("ow").StringPredicate;
        };
    };
    metadata: {
        relayHubAddress: import("ow").StringPredicate;
        relayMaxNonce: import("ow").NumberPredicate;
        signature: import("ow").StringPredicate;
    };
};
