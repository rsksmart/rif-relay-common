import { DeployRequest, RelayRequest } from './RelayRequest';
import { EIP712Domain, EIP712TypedData, EIP712TypeProperty, EIP712Types } from 'eth-sig-util';
import { PrefixedHexString } from 'ethereumjs-tx';
export declare const EIP712DomainType: {
    name: string;
    type: string;
}[];
export declare const ForwardRequestType: {
    name: string;
    type: string;
}[];
export declare const DeployRequestDataType: {
    name: string;
    type: string;
}[];
interface Types extends EIP712Types {
    EIP712Domain: EIP712TypeProperty[];
    RelayRequest: EIP712TypeProperty[];
    RelayData: EIP712TypeProperty[];
}
export declare const DomainSeparatorType: {
    prefix: string;
    name: string;
    version: string;
};
export declare function getDomainSeparator(verifyingContract: string, chainId: number): EIP712Domain;
export declare function getDomainSeparatorHash(verifier: string, chainId: number): PrefixedHexString;
export default class TypedRequestData implements EIP712TypedData {
    readonly types: Types;
    readonly domain: EIP712Domain;
    readonly primaryType: string;
    readonly message: any;
    constructor(chainId: number, verifier: string, relayRequest: RelayRequest);
}
export declare class TypedDeployRequestData implements EIP712TypedData {
    readonly types: Types;
    readonly domain: EIP712Domain;
    readonly primaryType: string;
    readonly message: any;
    constructor(chainId: number, verifier: string, relayRequest: DeployRequest);
}
export declare const ENVELOPING_PARAMS = "address relayHub,address from,address to,address tokenContract,uint256 value,uint256 gas,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,bytes data";
export declare const DEPLOY_PARAMS = "address relayHub,address from,address to,address tokenContract,address recoverer,uint256 value,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,uint256 index,bytes data";
export declare const RequestType: {
    typeName: string;
    typeSuffix: string;
};
export {};
