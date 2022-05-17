"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.DEPLOY_PARAMS = exports.ENVELOPING_PARAMS = exports.TypedDeployRequestData = exports.getDomainSeparatorHash = exports.getDomainSeparator = exports.DomainSeparatorType = exports.DeployRequestDataType = exports.ForwardRequestType = exports.EIP712DomainType = void 0;
const eth_sig_util_1 = require("eth-sig-util");
const ethereumjs_util_1 = require("ethereumjs-util");
//@ts-ignore
const source_map_support_1 = __importDefault(require("source-map-support"));
//@ts-ignore
source_map_support_1.default.install({ errorFormatterForce: true });
exports.EIP712DomainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
];
const RelayDataType = [
    { name: 'gasPrice', type: 'uint256' },
    { name: 'domainSeparator', type: 'bytes32' },
    { name: 'relayWorker', type: 'address' },
    { name: 'callForwarder', type: 'address' },
    { name: 'callVerifier', type: 'address' }
];
exports.ForwardRequestType = [
    { name: 'relayHub', type: 'address' },
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'tokenContract', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'tokenGas', type: 'uint256' },
    { name: 'data', type: 'bytes' }
];
exports.DeployRequestDataType = [
    { name: 'relayHub', type: 'address' },
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'tokenContract', type: 'address' },
    { name: 'recoverer', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'tokenGas', type: 'uint256' },
    { name: 'index', type: 'uint256' },
    { name: 'data', type: 'bytes' }
];
const RelayRequestType = [
    ...exports.ForwardRequestType,
    { name: 'relayData', type: 'RelayData' }
];
const DeployRequestType = [
    ...exports.DeployRequestDataType,
    { name: 'relayData', type: 'RelayData' }
];
// use these values in registerDomainSeparator
exports.DomainSeparatorType = {
    prefix: 'string name,string version',
    name: 'RSK Enveloping Transaction',
    version: '2'
};
function getDomainSeparator(verifyingContract, chainId) {
    return {
        name: exports.DomainSeparatorType.name,
        version: exports.DomainSeparatorType.version,
        chainId: chainId,
        verifyingContract: verifyingContract
    };
}
exports.getDomainSeparator = getDomainSeparator;
function getDomainSeparatorHash(verifier, chainId) {
    return ethereumjs_util_1.bufferToHex(eth_sig_util_1.TypedDataUtils.hashStruct('EIP712Domain', getDomainSeparator(verifier, chainId), { EIP712Domain: exports.EIP712DomainType }));
}
exports.getDomainSeparatorHash = getDomainSeparatorHash;
class TypedRequestData {
    constructor(chainId, verifier, relayRequest) {
        this.types = {
            EIP712Domain: exports.EIP712DomainType,
            RelayRequest: RelayRequestType,
            RelayData: RelayDataType
        };
        this.domain = getDomainSeparator(verifier, chainId);
        this.primaryType = 'RelayRequest';
        // in the signature, all "request" fields are flattened out at the top structure.
        // other params are inside "relayData" sub-type
        this.message = Object.assign(Object.assign({}, relayRequest.request), { relayData: relayRequest.relayData });
    }
}
exports.default = TypedRequestData;
class TypedDeployRequestData {
    constructor(chainId, verifier, relayRequest) {
        this.types = {
            EIP712Domain: exports.EIP712DomainType,
            RelayRequest: DeployRequestType,
            RelayData: RelayDataType
        };
        this.domain = getDomainSeparator(verifier, chainId);
        this.primaryType = 'RelayRequest';
        // in the signature, all "request" fields are flattened out at the top structure.
        // other params are inside "relayData" sub-type
        this.message = Object.assign(Object.assign({}, relayRequest.request), { relayData: relayRequest.relayData });
    }
}
exports.TypedDeployRequestData = TypedDeployRequestData;
exports.ENVELOPING_PARAMS = 'address relayHub,address from,address to,address tokenContract,uint256 value,uint256 gas,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,bytes data';
exports.DEPLOY_PARAMS = 'address relayHub,address from,address to,address tokenContract,address recoverer,uint256 value,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,uint256 index,bytes data';
exports.RequestType = {
    typeName: 'RelayRequest',
    typeSuffix: 'RelayData relayData)RelayData(uint256 gasPrice,bytes32 domainSeparator,address relayWorker,address callForwarder,address callVerifier)'
};
//# sourceMappingURL=TypedRequestData.js.map