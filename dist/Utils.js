"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionParamDataCost = exports.boolString = exports.isRegistrationValid = exports.getLatestEventData = exports.isSecondEventLater = exports.randomInRange = exports.sleep = exports.isSameAddress = exports.parseHexString = exports.estimateMaxPossibleRelayCallWithLinearFit = exports.calculateDeployTransactionMaxPossibleGas = exports.getEip712Signature = exports.getLocalEip712Signature = exports.decodeRevertReason = exports.address2topic = exports.addresses2topics = exports.event2topic = exports.padTo64 = exports.removeHexPrefix = void 0;
const web3_eth_abi_1 = __importDefault(require("web3-eth-abi"));
const web3_utils_1 = require("web3-utils");
const eth_sig_util_1 = __importDefault(require("eth-sig-util"));
const bytes_1 = require("@ethersproject/bytes");
const rif_relay_contracts_1 = require("@rsksmart/rif-relay-contracts");
const chalk_1 = __importDefault(require("chalk"));
const Constants_1 = require("./Constants");
const TruffleContract = require("@truffle/contract");
function removeHexPrefix(hex) {
    if (hex == null || typeof hex.replace !== 'function') {
        throw new Error('Cannot remove hex prefix');
    }
    return hex.replace(/^0x/, '');
}
exports.removeHexPrefix = removeHexPrefix;
const zeroPad = '0000000000000000000000000000000000000000000000000000000000000000';
function padTo64(hex) {
    if (hex.length < 64) {
        hex = (zeroPad + hex).slice(-64);
    }
    return hex;
}
exports.padTo64 = padTo64;
function event2topic(contract, names) {
    // for testing: don't crash on mockup..
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!contract.options || !contract.options.jsonInterface) {
        return names;
    }
    if (typeof names === 'string') {
        return event2topic(contract, [names])[0];
    }
    return (contract.options.jsonInterface
        .filter((e) => names.includes(e.name))
        // @ts-ignore
        .map(web3_eth_abi_1.default.encodeEventSignature));
}
exports.event2topic = event2topic;
function addresses2topics(addresses) {
    return addresses.map(address2topic);
}
exports.addresses2topics = addresses2topics;
function address2topic(address) {
    return '0x' + '0'.repeat(24) + address.toLowerCase().slice(2);
}
exports.address2topic = address2topic;
// extract revert reason from a revert bytes array.
function decodeRevertReason(revertBytes, throwOnError = false) {
    if (revertBytes == null) {
        return null;
    }
    if (!revertBytes.startsWith('0x08c379a0')) {
        if (throwOnError) {
            throw new Error('invalid revert bytes: ' + revertBytes);
        }
        return revertBytes;
    }
    // @ts-ignore
    return web3_eth_abi_1.default.decodeParameter('string', '0x' + revertBytes.slice(10));
}
exports.decodeRevertReason = decodeRevertReason;
function getLocalEip712Signature(typedRequestData, privateKey) {
    // @ts-ignore
    return eth_sig_util_1.default.signTypedData_v4(privateKey, { data: typedRequestData });
}
exports.getLocalEip712Signature = getLocalEip712Signature;
async function getEip712Signature(web3, typedRequestData, methodSuffix = '', jsonStringifyRequest = false) {
    const senderAddress = typedRequestData.message.from;
    let dataToSign;
    if (jsonStringifyRequest) {
        dataToSign = JSON.stringify(typedRequestData);
    }
    else {
        dataToSign = typedRequestData;
    }
    return await new Promise((resolve, reject) => {
        let method;
        // @ts-ignore (the entire web3 typing is fucked up)
        if (typeof web3.currentProvider.sendAsync === 'function') {
            // @ts-ignore
            method = web3.currentProvider.sendAsync;
        }
        else {
            // @ts-ignore
            method = web3.currentProvider.send;
        }
        method.bind(web3.currentProvider)({
            method: 'eth_signTypedData' + methodSuffix,
            params: [senderAddress, dataToSign],
            from: senderAddress,
            id: Date.now()
        }, (error, result) => {
            var _a;
            if ((result === null || result === void 0 ? void 0 : result.error) != null) {
                error = result.error;
            }
            if (error != null || result == null) {
                reject((_a = error.message) !== null && _a !== void 0 ? _a : error);
            }
            else {
                resolve(result.result);
            }
        });
    });
}
exports.getEip712Signature = getEip712Signature;
/**
 * @returns maximum possible gas consumption by this deploy call
 */
function calculateDeployTransactionMaxPossibleGas(estimatedDeployGas, estimatedTokenPaymentGas) {
    if (estimatedTokenPaymentGas === undefined ||
        estimatedTokenPaymentGas == null ||
        web3_utils_1.toBN(estimatedTokenPaymentGas).isZero()) {
        // Subsidized case
        return web3_utils_1.toBN(estimatedDeployGas).add(web3_utils_1.toBN('12000'));
    }
    else {
        return web3_utils_1.toBN(estimatedDeployGas);
    }
}
exports.calculateDeployTransactionMaxPossibleGas = calculateDeployTransactionMaxPossibleGas;
/**
 * @returns maximum possible gas consumption by this relay call
 * Note that not using the linear fit would result in an Inadequate amount of gas
 * You can add another kind of estimation (a hardcoded value for example) in that "else" statement
 * if you don't then use this function with usingLinearFit = true
 */
function estimateMaxPossibleRelayCallWithLinearFit(relayCallGasLimit, tokenPaymentGas, addCushion = false) {
    const cushion = addCushion
        ? Constants_1.constants.ESTIMATED_GAS_CORRECTION_FACTOR
        : 1.0;
    if (web3_utils_1.toBN(tokenPaymentGas).isZero()) {
        // Subsidized case
        // y = a0 + a1 * x = 85090.977 + 1.067 * x
        const a0 = Number('85090.977');
        const a1 = Number('1.067');
        const estimatedCost = a1 * relayCallGasLimit + a0;
        const costWithCushion = Math.ceil(estimatedCost * cushion);
        return costWithCushion;
    }
    else {
        // y = a0 + a1 * x = 72530.9611 + 1.1114 * x
        const a0 = Number('72530.9611');
        const a1 = Number('1.1114');
        const estimatedCost = a1 * (relayCallGasLimit + tokenPaymentGas) + a0;
        const costWithCushion = Math.ceil(estimatedCost * cushion);
        return costWithCushion;
    }
}
exports.estimateMaxPossibleRelayCallWithLinearFit = estimateMaxPossibleRelayCallWithLinearFit;
function parseHexString(str) {
    const result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}
exports.parseHexString = parseHexString;
function isSameAddress(address1, address2) {
    return address1.toLowerCase() === address2.toLowerCase();
}
exports.isSameAddress = isSameAddress;
async function sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
exports.randomInRange = randomInRange;
function isSecondEventLater(a, b) {
    if (a.blockNumber === b.blockNumber) {
        return b.transactionIndex > a.transactionIndex;
    }
    return b.blockNumber > a.blockNumber;
}
exports.isSecondEventLater = isSecondEventLater;
function getLatestEventData(events) {
    if (events.length === 0) {
        return;
    }
    const eventDataSorted = events.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
            return b.transactionIndex - a.transactionIndex;
        }
        return b.blockNumber - a.blockNumber;
    });
    return eventDataSorted[0];
}
exports.getLatestEventData = getLatestEventData;
function isRegistrationValid(relayData, config, managerAddress) {
    const portIncluded = config.url.indexOf(':') > 0;
    return (relayData !== undefined &&
        isSameAddress(relayData.manager, managerAddress) &&
        relayData.url.toString() ===
            config.url.toString() +
                (!portIncluded && config.port > 0
                    ? ':' + config.port.toString()
                    : ''));
}
exports.isRegistrationValid = isRegistrationValid;
function boolString(bool) {
    return bool
        ? chalk_1.default.green('good'.padEnd(14))
        : chalk_1.default.red('wrong'.padEnd(14));
}
exports.boolString = boolString;
function isDeployRequest(req) {
    let isDeploy = false;
    if (req.relayRequest.request.recoverer !== undefined) {
        isDeploy = true;
    }
    return isDeploy;
}
function transactionParamDataCost(req) {
    var _a;
    // @ts-ignore
    const IRelayHubContract = TruffleContract({
        contractName: 'IRelayHub',
        abi: rif_relay_contracts_1.IRelayHub.abi
    });
    IRelayHubContract.setProvider(web3.currentProvider, undefined);
    const relayHub = new IRelayHubContract('');
    const isDeploy = isDeployRequest(req);
    const method = isDeploy
        ? relayHub.contract.methods.deployCall(req.relayRequest, req.metadata.signature)
        : relayHub.contract.methods.relayCall(req.relayRequest, req.metadata.signature);
    const encodedCall = (_a = method.encodeABI()) !== null && _a !== void 0 ? _a : '0x';
    const dataAsByteArray = bytes_1.arrayify(encodedCall);
    const nonZeroes = nonZeroDataBytes(dataAsByteArray);
    const zeroVals = dataAsByteArray.length - nonZeroes;
    return (Constants_1.constants.TRANSACTION_GAS_COST +
        zeroVals * Constants_1.constants.TX_ZERO_DATA_GAS_COST +
        nonZeroes * Constants_1.constants.TX_NO_ZERO_DATA_GAS_COST);
}
exports.transactionParamDataCost = transactionParamDataCost;
function nonZeroDataBytes(data) {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
        const byte = data[i];
        if (byte !== 0) {
            ++counter;
        }
    }
    return counter;
}
//# sourceMappingURL=Utils.js.map