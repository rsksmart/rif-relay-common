"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayTransactionRequestShape = exports.DeployTransactionRequestShape = void 0;
const ow_1 = __importDefault(require("ow"));
exports.DeployTransactionRequestShape = {
    relayRequest: {
        request: {
            relayHub: ow_1.default.string,
            from: ow_1.default.string,
            to: ow_1.default.string,
            value: ow_1.default.string,
            nonce: ow_1.default.string,
            data: ow_1.default.string,
            tokenContract: ow_1.default.string,
            tokenAmount: ow_1.default.string,
            tokenGas: ow_1.default.string,
            recoverer: ow_1.default.string,
            index: ow_1.default.string
        },
        relayData: {
            gasPrice: ow_1.default.string,
            domainSeparator: ow_1.default.string,
            relayWorker: ow_1.default.string,
            callForwarder: ow_1.default.string,
            callVerifier: ow_1.default.string
        }
    },
    metadata: {
        relayHubAddress: ow_1.default.string,
        relayMaxNonce: ow_1.default.number,
        signature: ow_1.default.string
    }
};
exports.RelayTransactionRequestShape = {
    relayRequest: {
        request: {
            relayHub: ow_1.default.string,
            from: ow_1.default.string,
            to: ow_1.default.string,
            value: ow_1.default.string,
            gas: ow_1.default.string,
            nonce: ow_1.default.string,
            data: ow_1.default.string,
            tokenContract: ow_1.default.string,
            tokenAmount: ow_1.default.string,
            tokenGas: ow_1.default.string
        },
        relayData: {
            gasPrice: ow_1.default.string,
            domainSeparator: ow_1.default.string,
            relayWorker: ow_1.default.string,
            callForwarder: ow_1.default.string,
            callVerifier: ow_1.default.string
        }
    },
    metadata: {
        relayHubAddress: ow_1.default.string,
        relayMaxNonce: ow_1.default.number,
        signature: ow_1.default.string
    }
};
//# sourceMappingURL=RelayTransactionRequest.js.map