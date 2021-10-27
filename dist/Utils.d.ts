/// <reference types="node" />
/// <reference types="@openeth/truffle-typings" />
import { EIP712TypedData } from 'eth-sig-util';
import { EventData } from 'web3-eth-contract';
import { PrefixedHexString } from 'ethereumjs-tx';
import { DeployTransactionRequest, RelayTransactionRequest } from './types/RelayTransactionRequest';
import { RelayManagerData } from './types/RelayManagerData';
export declare function removeHexPrefix(hex: string): string;
export declare function padTo64(hex: string): string;
export declare function event2topic(contract: any, names: string[]): any;
export declare function addresses2topics(addresses: string[]): string[];
export declare function address2topic(address: string): string;
export declare function decodeRevertReason(revertBytes: PrefixedHexString, throwOnError?: boolean): string | null;
export declare function getLocalEip712Signature(typedRequestData: EIP712TypedData, privateKey: Buffer): PrefixedHexString;
export declare function getEip712Signature(web3: Web3, typedRequestData: EIP712TypedData, methodSuffix?: string, jsonStringifyRequest?: boolean): Promise<PrefixedHexString>;
/**
 * @returns maximum possible gas consumption by this deploy call
 */
export declare function calculateDeployTransactionMaxPossibleGas(estimatedDeployGas: string, estimatedTokenPaymentGas?: string): BN;
/**
 * @returns maximum possible gas consumption by this relay call
 * Note that not using the linear fit would result in an Inadequate amount of gas
 * You can add another kind of estimation (a hardcoded value for example) in that "else" statement
 * if you don't then use this function with usingLinearFit = true
 */
export declare function estimateMaxPossibleRelayCallWithLinearFit(relayCallGasLimit: number, tokenPaymentGas: number, addCushion?: boolean): number;
export declare function parseHexString(str: string): number[];
export declare function isSameAddress(address1: string, address2: string): boolean;
export declare function sleep(ms: number): Promise<void>;
export declare function randomInRange(min: number, max: number): number;
export declare function isSecondEventLater(a: EventData, b: EventData): boolean;
export declare function getLatestEventData(events: EventData[]): EventData | undefined;
export declare function isRegistrationValid(relayData: RelayManagerData | undefined, config: any, managerAddress: string): boolean;
export interface VerifierGasLimits {
    preRelayedCallGasLimit: string;
    postRelayedCallGasLimit: string;
}
export interface Signature {
    v: number[];
    r: number[];
    s: number[];
}
export declare function boolString(bool: boolean): string;
export declare function transactionParamDataCost(req: RelayTransactionRequest | DeployTransactionRequest): number;
