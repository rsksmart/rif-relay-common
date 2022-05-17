"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const web3_utils_1 = require("web3-utils");
const dayInSec = 24 * 60 * 60;
const weekInSec = dayInSec * 7;
const oneEther = web3_utils_1.toBN(1e18);
exports.constants = {
    dayInSec,
    weekInSec,
    oneEther,
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: new bn_js_1.default('2').pow(new bn_js_1.default('256')).sub(new bn_js_1.default('1')),
    MAX_INT256: new bn_js_1.default('2').pow(new bn_js_1.default('255')).sub(new bn_js_1.default('1')),
    MIN_INT256: new bn_js_1.default('2').pow(new bn_js_1.default('255')).mul(new bn_js_1.default('-1')),
    SHA3_NULL_S: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
    // The following constants must be updated accordingly whenever RSKJ updates them
    TRANSACTION_CREATE_CONTRACT_GAS_COST: 53000,
    TRANSACTION_GAS_COST: 21000,
    TX_ZERO_DATA_GAS_COST: 4,
    TX_NO_ZERO_DATA_GAS_COST: 68,
    MAX_ESTIMATED_GAS_DEVIATION: 0.2,
    ESTIMATED_GAS_CORRECTION_FACTOR: 1.0,
    INTERNAL_TRANSACTION_ESTIMATE_CORRECTION: 20000,
    WAIT_FOR_RECEIPT_RETRIES: 6,
    WAIT_FOR_RECEIPT_INITIAL_BACKOFF: 1000
};
//# sourceMappingURL=Constants.js.map