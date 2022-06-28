import Web3 from 'web3';
import { BlockTransactionString } from 'web3-eth';
import { EventData, PastEventOptions } from 'web3-eth-contract';
import { PrefixedHexString, TransactionOptions } from 'ethereumjs-tx';
import { BlockNumber, HttpProvider, IpcProvider, provider, Transaction, TransactionReceipt, WebsocketProvider } from 'web3-core';
import { DeployRequest, RelayRequest } from './EIP712/RelayRequest';
import { RelayManagerData } from '@rsksmart/rif-relay-contracts';
import { IForwarderInstance, IRelayVerifierInstance, IRelayHubInstance, IDeployVerifierInstance, IWalletFactoryInstance, ITokenHandlerInstance } from '@rsksmart/rif-relay-contracts/types/truffle-contracts';
import { EnvelopingConfig } from './types/EnvelopingConfig';
import EnvelopingTransactionDetails from './types/EnvelopingTransactionDetails';
import BN from 'bn.js';
import { DeployTransactionRequest, RelayTransactionRequest } from './types/RelayTransactionRequest';
declare type EventName = string;
export interface EstimateGasParams {
    from: string;
    to: string;
    data: PrefixedHexString;
    gasPrice?: PrefixedHexString;
}
export declare const RelayServerRegistered: EventName;
export declare const RelayWorkersAdded: EventName;
export declare const TransactionRelayed: EventName;
export declare const TransactionRejectedByRecipient: EventName;
export declare const StakeAdded: EventName;
export declare const StakeUnlocked: EventName;
export declare const StakeWithdrawn: EventName;
export declare const StakePenalized: EventName;
export declare type Web3Provider = HttpProvider | IpcProvider | WebsocketProvider;
export default class ContractInteractor {
    private readonly VERSION;
    private readonly IRelayVerifierContract;
    private readonly IDeployVerifierContract;
    private readonly ITokenHandlerContract;
    private readonly IRelayHubContract;
    private readonly IForwarderContract;
    private readonly IWalletFactoryContract;
    private relayVerifierInstance;
    private deployVerifierInstance;
    relayHubInstance: IRelayHubInstance;
    readonly web3: Web3;
    private readonly provider;
    private readonly config;
    private readonly versionManager;
    private rawTxOptions?;
    chainId: number;
    private networkId?;
    private networkType?;
    constructor(provider: Web3Provider, config: EnvelopingConfig);
    getProvider(): provider;
    init(): Promise<void>;
    isInitialized(): boolean;
    _setNetworkType(): Promise<void>;
    getAsyncChainId(): Promise<number>;
    _validateCompatibility(): Promise<void>;
    _validateVersion(version: string): void;
    _initializeContracts(): Promise<void>;
    getRawTxOptions(): TransactionOptions;
    _createRelayVerifier(address: string): Promise<IRelayVerifierInstance>;
    _createDeployVerifier(address: string): Promise<IDeployVerifierInstance>;
    createTokenHandler(address: string): Promise<ITokenHandlerInstance>;
    _createRelayHub(address: string): Promise<IRelayHubInstance>;
    _createForwarder(address: string): Promise<IForwarderInstance>;
    _createFactory(address: string): Promise<IWalletFactoryInstance>;
    getSenderNonce(sWallet: string): Promise<string>;
    getFactoryNonce(factoryAddr: string, from: string): Promise<string>;
    _getBlockGasLimit(): Promise<number>;
    validateAcceptRelayCall(relayRequest: RelayRequest, signature: PrefixedHexString): Promise<{
        verifierAccepted: boolean;
        returnValue: string;
        reverted: boolean;
        revertedInDestination: boolean;
    }>;
    validateAcceptDeployCall(request: DeployTransactionRequest): Promise<{
        verifierAccepted: boolean;
        returnValue: string;
        reverted: boolean;
    }>;
    getMaxViewableDeployGasLimit(request: DeployTransactionRequest): Promise<BN>;
    estimateRelayTransactionMaxPossibleGas(relayRequest: RelayRequest, signature: PrefixedHexString): Promise<number>;
    estimateRelayTransactionMaxPossibleGasWithTransactionRequest(request: RelayTransactionRequest): Promise<number>;
    estimateDestinationContractCallGas(transactionDetails: EstimateGasParams, addCushion?: boolean): Promise<number>;
    getMaxViewableRelayGasLimit(relayRequest: RelayRequest, signature: PrefixedHexString): Promise<number>;
    encodeRelayCallABI(relayRequest: RelayRequest, sig: PrefixedHexString): PrefixedHexString;
    encodeDeployCallABI(relayRequest: DeployRequest, sig: PrefixedHexString): PrefixedHexString;
    getActiveRelayInfo(relayManagers: Set<string>): Promise<RelayManagerData[]>;
    getRelayInfo(relayManagers: Set<string>): Promise<RelayManagerData[]>;
    getPastEventsForHub(extraTopics: string[], options: PastEventOptions, names?: EventName[]): Promise<EventData[]>;
    getPastEventsForStakeManagement(names: EventName[], extraTopics: string[], options: PastEventOptions): Promise<EventData[]>;
    _getPastEvents(contract: any, names: EventName[], extraTopics: string[], options: PastEventOptions): Promise<EventData[]>;
    getBalance(address: string, defaultBlock?: BlockNumber): Promise<string>;
    getBlockNumber(): Promise<number>;
    sendSignedTransaction(rawTx: string): Promise<TransactionReceipt>;
    estimateGas(transactionDetails: EnvelopingTransactionDetails): Promise<number>;
    getGasPrice(): Promise<string>;
    getTransactionCount(address: string, defaultBlock?: BlockNumber): Promise<number>;
    getTransaction(transactionHash: string): Promise<Transaction>;
    getBlock(blockHashOrBlockNumber: BlockNumber): Promise<BlockTransactionString>;
    validateAddress(address: string, exceptionTitle?: string): void;
    getCode(address: string): Promise<string>;
    getChainId(): number;
    getNetworkId(): number;
    getNetworkType(): string;
    isContractDeployed(address: string): Promise<boolean>;
    getStakeInfo(managerAddress: string): Promise<{
        stake: string;
        unstakeDelay: string;
        withdrawBlock: string;
        owner: string;
    }>;
    walletFactoryDeployEstimateGasForInternalCall(request: DeployRequest, factory: string, suffixData: string, signature: string, testCall?: boolean): Promise<number>;
    walletFactoryEstimateGasOfDeployCall(request: DeployTransactionRequest): Promise<number>;
    getRegisterRelayMethod(url: string): Promise<any>;
    getAddRelayWorkersMethod(workers: string[]): Promise<any>;
    /**
     * Web3.js as of 1.2.6 (see web3-core-method::_confirmTransaction) does not allow
     * broadcasting of a transaction without waiting for it to be mined.
     * This method sends the RPC call directly
     * @param signedTransaction - the raw signed transaction to broadcast
     */
    broadcastTransaction(signedTransaction: PrefixedHexString): Promise<PrefixedHexString>;
    getTransactionReceipt(transactionHash: PrefixedHexString, retries?: number, initialBackoff?: number): Promise<TransactionReceipt>;
}
/**
 * Ganache does not seem to enforce EIP-155 signature. Buidler does, though.
 * This is how {@link Transaction} constructor allows support for custom and private network.
 * @param chainId
 * @param networkId
 * @param chain
 * @return {{common: Common}}
 */
export declare function getRawTxOptions(chainId: number, networkId: number, chain?: string): TransactionOptions;
export {};
