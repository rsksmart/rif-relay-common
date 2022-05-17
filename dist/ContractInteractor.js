"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRawTxOptions = exports.StakePenalized = exports.StakeWithdrawn = exports.StakeUnlocked = exports.StakeAdded = exports.TransactionRejectedByRecipient = exports.TransactionRelayed = exports.RelayWorkersAdded = exports.RelayServerRegistered = void 0;
const ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
const web3_1 = __importDefault(require("web3"));
const loglevel_1 = __importDefault(require("loglevel"));
const rif_relay_contracts_1 = require("@rsksmart/rif-relay-contracts");
const Utils_1 = require("./Utils");
const Constants_1 = require("./Constants");
const ErrorReplacerJSON_1 = __importDefault(require("./ErrorReplacerJSON"));
const VersionsManager_1 = __importDefault(require("./VersionsManager"));
const web3_utils_1 = require("web3-utils");
// Truffle Contract typings seem to be completely out of their minds
const TruffleContract = require("@truffle/contract");
//@ts-ignore
const source_map_support_1 = __importDefault(require("source-map-support"));
//@ts-ignore
source_map_support_1.default.install({ errorFormatterForce: true });
exports.RelayServerRegistered = 'RelayServerRegistered';
exports.RelayWorkersAdded = 'RelayWorkersAdded';
exports.TransactionRelayed = 'TransactionRelayed';
exports.TransactionRejectedByRecipient = 'TransactionRelayedButRevertedByRecipient';
const ActiveManagerEvents = [
    exports.RelayServerRegistered,
    exports.RelayWorkersAdded,
    exports.TransactionRelayed,
    exports.TransactionRejectedByRecipient
];
exports.StakeAdded = 'StakeAdded';
exports.StakeUnlocked = 'StakeUnlocked';
exports.StakeWithdrawn = 'StakeWithdrawn';
exports.StakePenalized = 'StakePenalized';
class ContractInteractor {
    constructor(provider, config) {
        this.VERSION = '2.0.1';
        this.versionManager = new VersionsManager_1.default(this.VERSION);
        this.web3 = new web3_1.default(provider);
        this.config = config;
        this.provider = provider;
        this.chainId = config.chainId;
        // @ts-ignore
        this.IRelayVerifierContract = TruffleContract({
            contractName: 'IRelayVerifier',
            abi: rif_relay_contracts_1.IRelayVerifier.abi
        });
        // @ts-ignore
        this.IDeployVerifierContract = TruffleContract({
            contractName: 'IDeployVerifier',
            abi: rif_relay_contracts_1.IDeployVerifier.abi
        });
        // @ts-ignore
        this.IRelayHubContract = TruffleContract({
            contractName: 'IRelayHub',
            abi: rif_relay_contracts_1.IRelayHub.abi
        });
        // @ts-ignore
        this.IForwarderContract = TruffleContract({
            contractName: 'IForwarder',
            abi: rif_relay_contracts_1.IForwarder.abi
        });
        // @ts-ignore
        this.IWalletFactoryContract = TruffleContract({
            contractName: 'IWalletFactory',
            abi: rif_relay_contracts_1.IWalletFactory.abi
        });
        // @ts-ignore
        this.ITokenHandlerContract = TruffleContract({
            contractName: 'ITokenHandler',
            abi: rif_relay_contracts_1.ITokenHandler.abi
        });
        this.IRelayHubContract.setProvider(this.provider, undefined);
        this.IRelayVerifierContract.setProvider(this.provider, undefined);
        this.IDeployVerifierContract.setProvider(this.provider, undefined);
        this.IForwarderContract.setProvider(this.provider, undefined);
        this.IWalletFactoryContract.setProvider(this.provider, undefined);
        this.ITokenHandlerContract.setProvider(this.provider, undefined);
    }
    getProvider() {
        return this.provider;
    }
    async init() {
        loglevel_1.default.debug('Contract Interactor - Initializing');
        if (this.isInitialized()) {
            throw new Error('_init has already called');
        }
        await this._initializeContracts();
        loglevel_1.default.debug('Contract Interactor - Initialized succesfully');
        await this._validateCompatibility().catch((err) => loglevel_1.default.warn('WARNING: beta ignore version compatibility', err.message));
        await this._setChaindId();
        await this._setNetworkId();
        await this._setNetworkType();
        loglevel_1.default.debug(`Contract Interactor - Using chainId: ${this.chainId}, networkId:${this.networkId} , networkType:${this.networkType} `);
        // chain === 'private' means we're on ganache, and ethereumjs-tx.Transaction doesn't support that chain type
        this.rawTxOptions = getRawTxOptions(this.chainId, this.networkId, this.networkType);
    }
    isInitialized() {
        return this.rawTxOptions != null;
    }
    async _setChaindId() {
        try {
            this.chainId = await this.web3.eth.getChainId();
        }
        catch (e) {
            loglevel_1.default.debug(e);
            throw new Error('Could not retreive the chainId');
        }
    }
    async _setNetworkId() {
        try {
            this.networkId = await this.web3.eth.net.getId();
        }
        catch (e) {
            loglevel_1.default.debug(e);
            throw new Error('Could not retreive the networkId');
        }
    }
    async _setNetworkType() {
        try {
            this.networkType = await this.web3.eth.net.getNetworkType();
        }
        catch (e) {
            loglevel_1.default.warn('WARNING: Could not retreive the network type, used default value private');
            this.networkType = 'private';
        }
    }
    async _validateCompatibility() {
        if (this.config.relayHubAddress === Constants_1.constants.ZERO_ADDRESS) {
            return;
        }
        const hub = this.relayHubInstance;
        const version = await hub.versionHub();
        this._validateVersion(version);
    }
    _validateVersion(version) {
        const isNewer = this.versionManager.isMinorSameOrNewer(version);
        if (!isNewer) {
            throw new Error(`Provided Hub version(${version}) is not supported by the current interactor(${this.versionManager.componentVersion})`);
        }
    }
    async _initializeContracts() {
        if (this.config.relayHubAddress !== Constants_1.constants.ZERO_ADDRESS) {
            this.relayHubInstance = await this._createRelayHub(this.config.relayHubAddress);
            loglevel_1.default.debug(`Contract Interactor - Relay Hub initialized: ${this.relayHubInstance.address}`);
        }
        if (this.config.relayVerifierAddress !== Constants_1.constants.ZERO_ADDRESS) {
            this.relayVerifierInstance = await this._createRelayVerifier(this.config.relayVerifierAddress);
            loglevel_1.default.debug(`Contract Interactor - Relay Verifier initialized: ${this.relayVerifierInstance.address}`);
        }
        if (this.config.deployVerifierAddress !== Constants_1.constants.ZERO_ADDRESS) {
            this.deployVerifierInstance = await this._createDeployVerifier(this.config.deployVerifierAddress);
            loglevel_1.default.debug(`Contract Interactor - Deploy Verifier initialized: ${this.deployVerifierInstance.address}`);
        }
        loglevel_1.default.info('Contracts initialized correctly');
    }
    // must use these options when creating Transaction object
    getRawTxOptions() {
        if (this.rawTxOptions == null) {
            throw new Error('_init not called');
        }
        return this.rawTxOptions;
    }
    async _createRelayVerifier(address) {
        return await this.IRelayVerifierContract.at(address);
    }
    async _createDeployVerifier(address) {
        return await this.IDeployVerifierContract.at(address);
    }
    async createTokenHandler(address) {
        return await this.ITokenHandlerContract.at(address);
    }
    async _createRelayHub(address) {
        return await this.IRelayHubContract.at(address);
    }
    async _createForwarder(address) {
        return await this.IForwarderContract.at(address);
    }
    async _createFactory(address) {
        return await this.IWalletFactoryContract.at(address);
    }
    async getSenderNonce(sWallet) {
        const forwarder = await this._createForwarder(sWallet);
        const nonce = await forwarder.nonce();
        return nonce.toString();
    }
    async getFactoryNonce(factoryAddr, from) {
        const factory = await this._createFactory(factoryAddr);
        const nonce = await factory.nonce(from);
        return nonce.toString();
    }
    async _getBlockGasLimit() {
        const latestBlock = await this.web3.eth.getBlock('latest');
        return latestBlock.gasLimit;
    }
    async validateAcceptRelayCall(relayRequest, signature) {
        const relayHub = this.relayHubInstance;
        const externalGasLimit = await this.getMaxViewableRelayGasLimit(relayRequest, signature);
        if (externalGasLimit === 0) {
            // The relayWorker does not have enough balance for this transaction
            return {
                verifierAccepted: false,
                reverted: false,
                returnValue: `relayWorker ${relayRequest.relayData.relayWorker} does not have enough balance to cover the maximum possible gas for this transaction`,
                revertedInDestination: false
            };
        }
        // First call the verifier
        try {
            await this.relayVerifierInstance.contract.methods
                .verifyRelayedCall(relayRequest, signature)
                .call({
                from: relayRequest.relayData.relayWorker
            }, 'pending');
        }
        catch (e) {
            const message = e instanceof Error
                ? e.message
                : JSON.stringify(e, ErrorReplacerJSON_1.default);
            return {
                verifierAccepted: false,
                reverted: false,
                returnValue: `view call to 'relayCall' reverted in verifier: ${message}`,
                revertedInDestination: false
            };
        }
        // If the verified passed, try relaying the transaction (in local view call)
        try {
            const res = await relayHub.contract.methods
                .relayCall(relayRequest, signature)
                .call({
                from: relayRequest.relayData.relayWorker,
                gasPrice: relayRequest.relayData.gasPrice,
                gas: web3_utils_1.toHex(externalGasLimit)
            });
            // res is destinationCallSuccess
            return {
                verifierAccepted: true,
                reverted: false,
                returnValue: '',
                revertedInDestination: !res
            };
        }
        catch (e) {
            const message = e instanceof Error
                ? e.message
                : JSON.stringify(e, ErrorReplacerJSON_1.default);
            return {
                verifierAccepted: true,
                reverted: true,
                returnValue: `view call to 'relayCall' reverted in client: ${message}`,
                revertedInDestination: false
            };
        }
    }
    async validateAcceptDeployCall(request) {
        const relayHub = this.relayHubInstance;
        const externalGasLimit = await this.getMaxViewableDeployGasLimit(request);
        if (externalGasLimit.eq(web3_utils_1.toBN(0))) {
            // The relayWorker does not have enough balance for this transaction
            return {
                verifierAccepted: false,
                reverted: false,
                returnValue: `relayWorker ${request.relayRequest.relayData.relayWorker} does not have enough balance to cover the maximum possible gas for this transaction`
            };
        }
        // First call the verifier
        try {
            await this.deployVerifierInstance.contract.methods
                .verifyRelayedCall(request.relayRequest, request.metadata.signature)
                .call({
                from: request.relayRequest.relayData.relayWorker
            });
        }
        catch (e) {
            const message = e instanceof Error
                ? e.message
                : JSON.stringify(e, ErrorReplacerJSON_1.default);
            return {
                verifierAccepted: false,
                reverted: false,
                returnValue: `view call to 'deploy call' reverted in verifier: ${message}`
            };
        }
        // If the verified passed, try relaying the transaction (in local view call)
        try {
            const res = await relayHub.contract.methods
                .deployCall(request.relayRequest, request.metadata.signature)
                .call({
                from: request.relayRequest.relayData.relayWorker,
                gasPrice: request.relayRequest.relayData.gasPrice,
                gas: externalGasLimit
            });
            return {
                verifierAccepted: true,
                reverted: false,
                returnValue: res.returnValue
            };
        }
        catch (e) {
            const message = e instanceof Error
                ? e.message
                : JSON.stringify(e, ErrorReplacerJSON_1.default);
            return {
                verifierAccepted: true,
                reverted: true,
                returnValue: `view call to 'deployCall' reverted in client: ${message}`
            };
        }
    }
    async getMaxViewableDeployGasLimit(request) {
        const gasPrice = web3_utils_1.toBN(request.relayRequest.relayData.gasPrice);
        let gasLimit = web3_utils_1.toBN(0);
        if (!gasPrice.eq(web3_utils_1.toBN(0))) {
            const maxEstimatedGas = web3_utils_1.toBN(await this.walletFactoryEstimateGasOfDeployCall(request));
            const workerBalanceAsUnitsOfGas = web3_utils_1.toBN(await this.getBalance(request.relayRequest.relayData.relayWorker)).div(gasPrice);
            if (workerBalanceAsUnitsOfGas.gte(maxEstimatedGas)) {
                gasLimit = maxEstimatedGas;
            }
        }
        return gasLimit;
    }
    async estimateRelayTransactionMaxPossibleGas(relayRequest, signature) {
        const maxPossibleGas = await this.estimateGas({
            from: relayRequest.relayData.relayWorker,
            to: relayRequest.request.relayHub,
            data: this.relayHubInstance.contract.methods
                .relayCall(relayRequest, signature)
                .encodeABI(),
            gasPrice: relayRequest.relayData.gasPrice
        });
        // TODO RIF Team: Once the exactimator is available on the RSK node, then ESTIMATED_GAS_CORRECTION_FACTOR can be removed (in our tests it is 1.0 anyway, so it's not active)
        return Math.ceil(maxPossibleGas * Constants_1.constants.ESTIMATED_GAS_CORRECTION_FACTOR);
    }
    async estimateRelayTransactionMaxPossibleGasWithTransactionRequest(request) {
        if (request.metadata.relayHubAddress === undefined ||
            request.metadata.relayHubAddress === null ||
            request.metadata.relayHubAddress === Constants_1.constants.ZERO_ADDRESS) {
            throw new Error('calculateDeployCallGas: RelayHub must be defined');
        }
        const rHub = await this._createRelayHub(request.metadata.relayHubAddress);
        const method = rHub.contract.methods.relayCall(request.relayRequest, request.metadata.signature);
        const maxPossibleGas = await method.estimateGas({
            from: request.relayRequest.relayData.relayWorker,
            gasPrice: request.relayRequest.relayData.gasPrice
        });
        // TODO RIF Team: Once the exactimator is available on the RSK node, then ESTIMATED_GAS_CORRECTION_FACTOR can be removed (in our tests it is 1.0 anyway, so it's not active)
        return Math.ceil(maxPossibleGas * Constants_1.constants.ESTIMATED_GAS_CORRECTION_FACTOR);
    }
    async estimateDestinationContractCallGas(transactionDetails, addCushion = true) {
        // For relay calls, transactionDetails.gas is only the portion of gas sent to the destination contract, the tokenPayment
        // Part is done before, by the SmartWallet
        const estimated = await this.estimateGas({
            from: transactionDetails.from,
            to: transactionDetails.to,
            gasPrice: transactionDetails.gasPrice,
            data: transactionDetails.data
        });
        let internalCallCost = estimated > Constants_1.constants.INTERNAL_TRANSACTION_ESTIMATE_CORRECTION
            ? estimated - Constants_1.constants.INTERNAL_TRANSACTION_ESTIMATE_CORRECTION
            : estimated;
        // The INTERNAL_TRANSACTION_ESTIMATE_CORRECTION is substracted because the estimation is done using web3.eth.estimateGas which
        // estimates the call as if it where an external call, and in our case it will be called internally (it's not the same cost).
        // Because of this, the estimated maxPossibleGas in the server (which estimates the whole transaction) might not be enough to successfully pass
        // the following verification made in the SmartWallet:
        // require(gasleft() > req.gas, "Not enough gas left"). This is done right before calling the destination internally
        if (addCushion) {
            internalCallCost =
                internalCallCost * Constants_1.constants.ESTIMATED_GAS_CORRECTION_FACTOR;
        }
        return internalCallCost;
    }
    async getMaxViewableRelayGasLimit(relayRequest, signature) {
        const gasPrice = web3_utils_1.toBN(relayRequest.relayData.gasPrice);
        let gasLimit = 0;
        if (gasPrice.gt(web3_utils_1.toBN(0))) {
            const maxEstimatedGas = await this.estimateRelayTransactionMaxPossibleGas(relayRequest, signature);
            const workerBalanceAsUnitsOfGas = web3_utils_1.toBN(await this.getBalance(relayRequest.relayData.relayWorker)).div(gasPrice);
            if (workerBalanceAsUnitsOfGas.gte(web3_utils_1.toBN(maxEstimatedGas))) {
                gasLimit = maxEstimatedGas;
            }
        }
        return gasLimit;
    }
    encodeRelayCallABI(relayRequest, sig) {
        // TODO: check this works as expected
        // @ts-ignore
        const relayHub = new this.IRelayHubContract('');
        return relayHub.contract.methods
            .relayCall(relayRequest, sig)
            .encodeABI();
    }
    encodeDeployCallABI(relayRequest, sig) {
        // TODO: check this works as expected
        // @ts-ignore
        const relayHub = new this.IRelayHubContract('');
        return relayHub.contract.methods
            .deployCall(relayRequest, sig)
            .encodeABI();
    }
    async getActiveRelayInfo(relayManagers) {
        const results = await this.getRelayInfo(relayManagers);
        return results.filter((relayData) => relayData.registered && relayData.currentlyStaked);
    }
    async getRelayInfo(relayManagers) {
        const managers = Array.from(relayManagers);
        const contractCalls = managers.map((managerAddress) => this.relayHubInstance.getRelayInfo(managerAddress));
        return await Promise.all(contractCalls);
    }
    async getPastEventsForHub(extraTopics, options, names = ActiveManagerEvents) {
        return await this._getPastEvents(this.relayHubInstance.contract, names, extraTopics, options);
    }
    async getPastEventsForStakeManagement(names, extraTopics, options) {
        const relayHub = this.relayHubInstance;
        return await this._getPastEvents(relayHub.contract, names, extraTopics, options);
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async _getPastEvents(contract, names, extraTopics, options) {
        const topics = [];
        const eventTopic = Utils_1.event2topic(contract, names);
        topics.push(eventTopic);
        if (extraTopics.length > 0) {
            topics.push(extraTopics);
        }
        return contract.getPastEvents('allEvents', Object.assign({}, options, { topics }));
    }
    async getBalance(address, defaultBlock = 'latest') {
        return await this.web3.eth.getBalance(address, defaultBlock);
    }
    async getBlockNumber() {
        return await this.web3.eth.getBlockNumber();
    }
    async sendSignedTransaction(rawTx) {
        // noinspection ES6RedundantAwait - PromiEvent makes lint less happy about this line
        return await this.web3.eth.sendSignedTransaction(rawTx);
    }
    async estimateGas(transactionDetails) {
        return await this.web3.eth.estimateGas(transactionDetails);
    }
    // TODO: cache response for some time to optimize. It doesn't make sense to optimize these requests in calling code.
    async getGasPrice() {
        return await this.web3.eth.getGasPrice();
    }
    async getTransactionCount(address, defaultBlock) {
        // @ts-ignore (web3 does not define 'defaultBlock' as optional)
        return await this.web3.eth.getTransactionCount(address, defaultBlock);
    }
    async getTransaction(transactionHash) {
        return await this.web3.eth.getTransaction(transactionHash);
    }
    async getBlock(blockHashOrBlockNumber) {
        return await this.web3.eth.getBlock(blockHashOrBlockNumber);
    }
    validateAddress(address, exceptionTitle = 'invalid address:') {
        if (!this.web3.utils.isAddress(address)) {
            throw new Error(exceptionTitle + ' ' + address);
        }
    }
    async getCode(address) {
        return await this.web3.eth.getCode(address);
    }
    getChainId() {
        if (this.chainId == null) {
            throw new Error('_init not called');
        }
        return this.chainId;
    }
    getNetworkId() {
        if (this.networkId == null) {
            throw new Error('_init not called');
        }
        return this.networkId;
    }
    getNetworkType() {
        if (this.networkType == null) {
            throw new Error('_init not called');
        }
        return this.networkType;
    }
    async isContractDeployed(address) {
        const code = await this.getCode(address);
        // Check added for RSKJ: when the contract does not exist in RSKJ it replies to the getCode call with 0x00
        return code !== '0x' && code !== '0x00';
    }
    async getStakeInfo(managerAddress) {
        return await this.relayHubInstance.getStakeInfo(managerAddress);
    }
    async walletFactoryDeployEstimateGasForInternalCall(request, factory, domainHash, suffixData, signature, testCall = false) {
        const pFactory = await this._createFactory(factory);
        const method = pFactory.contract.methods.relayedUserSmartWalletCreation(request.request, domainHash, suffixData, signature);
        if (testCall) {
            await method.call({ from: request.request.relayHub });
        }
        return method.estimateGas({
            from: request.request.relayHub,
            gasPrice: request.relayData.gasPrice
        });
    }
    async walletFactoryEstimateGasOfDeployCall(request) {
        if (request.metadata.relayHubAddress === undefined ||
            request.metadata.relayHubAddress === null ||
            request.metadata.relayHubAddress === Constants_1.constants.ZERO_ADDRESS) {
            throw new Error('calculateDeployCallGas: RelayHub must be defined');
        }
        const rHub = await this._createRelayHub(request.metadata.relayHubAddress);
        const method = rHub.contract.methods.deployCall(request.relayRequest, request.metadata.signature);
        return method.estimateGas({
            from: request.relayRequest.relayData.relayWorker,
            gasPrice: request.relayRequest.relayData.gasPrice
        });
    }
    // TODO: a way to make a relay hub transaction with a specified nonce without exposing the 'method' abstraction
    async getRegisterRelayMethod(url) {
        const hub = this.relayHubInstance;
        return hub.contract.methods.registerRelayServer(url);
    }
    async getAddRelayWorkersMethod(workers) {
        const hub = this.relayHubInstance;
        return hub.contract.methods.addRelayWorkers(workers);
    }
    /**
     * Web3.js as of 1.2.6 (see web3-core-method::_confirmTransaction) does not allow
     * broadcasting of a transaction without waiting for it to be mined.
     * This method sends the RPC call directly
     * @param signedTransaction - the raw signed transaction to broadcast
     */
    async broadcastTransaction(signedTransaction) {
        return await new Promise((resolve, reject) => {
            if (this.provider == null) {
                throw new Error('provider is not set');
            }
            this.provider.send({
                jsonrpc: '2.0',
                method: 'eth_sendRawTransaction',
                params: [signedTransaction],
                id: Date.now()
            }, (e, r) => {
                if (e != null) {
                    reject(e);
                }
                else if (r.error != null) {
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }
    async getTransactionReceipt(transactionHash, retries = Constants_1.constants.WAIT_FOR_RECEIPT_RETRIES, initialBackoff = Constants_1.constants.WAIT_FOR_RECEIPT_INITIAL_BACKOFF) {
        for (let tryCount = 0, backoff = initialBackoff; tryCount < retries; tryCount++, backoff *= 2) {
            const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (receipt) {
                return receipt;
            }
            await Utils_1.sleep(backoff);
        }
        throw new Error(`No receipt found for this transaction ${transactionHash}`);
    }
}
exports.default = ContractInteractor;
/**
 * Ganache does not seem to enforce EIP-155 signature. Buidler does, though.
 * This is how {@link Transaction} constructor allows support for custom and private network.
 * @param chainId
 * @param networkId
 * @param chain
 * @return {{common: Common}}
 */
function getRawTxOptions(chainId, networkId, chain) {
    if (chain == null || chain === 'main' || chain === 'private') {
        chain = 'mainnet';
    }
    return {
        common: ethereumjs_common_1.default.forCustomChain(chain, {
            chainId,
            networkId
        }, 'istanbul')
    };
}
exports.getRawTxOptions = getRawTxOptions;
//# sourceMappingURL=ContractInteractor.js.map