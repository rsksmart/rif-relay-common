import type {
  Block,
  JsonRpcProvider,
  TransactionResponse,
} from '@ethersproject/providers';
import {
  DeployVerifier,
  DeployVerifier__factory,
  IForwarder__factory,
  IRelayHub,
  IRelayHub__factory,
  IWalletFactory__factory,
  RelayHub,
  RelayHub__factory,
  RelayVerifier,
  RelayVerifier__factory,
} from '@rsksmart/rif-relay-contracts';
import type {
  EnvelopingTypes,
  TypedEvent,
} from '@rsksmart/rif-relay-contracts';
import {
  BigNumber,
  BigNumberish,
  constants,
  ContractTransaction,
  FixedNumber,
} from 'ethers';
import type {
  DefaultManagerEvent,
  EstimateGasParams,
  ManagerEvent,
  PastEventOptions,
} from 'types/ContractInteractor.types';
import type { EnvelopingConfig } from 'types/EnvelopingConfig';
import type {
  DeployTransactionRequest,
  RelayTransactionRequest,
} from 'types/RelayTransactionRequest';
import {
  ESTIMATED_GAS_CORRECTION_FACTOR,
  INTERNAL_TRANSACTION_ESTIMATE_CORRECTION,
} from './constants';
import VersionsManager from './VersionsManager';

const DEFAULT_MANAGER_EVENTS: DefaultManagerEvent[] = [
  'RelayServerRegistered',
  'RelayWorkersAdded',
  'TransactionRelayed',
  'TransactionRelayedButRevertedByRecipient',
];

export default class ContractInteractor {
  private readonly VERSION = '2.0.1';

  private static instance: ContractInteractor;

  private _relayVerifier: RelayVerifier;

  private _deployVerifier: DeployVerifier;

  private _relayHub: RelayHub;

  private readonly _provider: JsonRpcProvider;

  public get provider(): JsonRpcProvider {
    return this._provider;
  }

  public get relayHub(): RelayHub {
    return this._relayHub;
  }

  private readonly _config: EnvelopingConfig;

  public get config(): EnvelopingConfig {
    return this._config;
  }

  private readonly _versionManager: VersionsManager;

  public get versionManager(): VersionsManager {
    return this._versionManager;
  }

  public static async getInstance(
    provider: JsonRpcProvider,
    config: EnvelopingConfig
  ): Promise<ContractInteractor> {
    if (!ContractInteractor.instance) {
      ContractInteractor.instance = new ContractInteractor(provider, config);
      const version = await ContractInteractor.instance._relayHub.versionHub();
      ContractInteractor.instance._validateVersion(version);
    }

    return ContractInteractor.instance;
  }

  private constructor(provider: JsonRpcProvider, config: EnvelopingConfig) {
    const { relayHubAddress, relayVerifierAddress, deployVerifierAddress } =
      config;

    this._versionManager = new VersionsManager(this.VERSION);
    this._config = config;
    this._provider = provider;

    this._relayHub = RelayHub__factory.connect(relayHubAddress, provider);
    this._relayVerifier = RelayVerifier__factory.connect(
      relayVerifierAddress,
      provider
    );
    this._deployVerifier = DeployVerifier__factory.connect(
      deployVerifierAddress,
      provider
    );
  }

  _validateVersion(version: string): void {
    const isNewer = this.versionManager.isMinorSameOrNewer(version);
    if (!isNewer) {
      throw new Error(
        `Provided Hub version(${version}) is not supported by the current interactor(${this.versionManager.componentVersion})`
      );
    }
  }

  async getSenderNonce(sWallet: string): Promise<string> {
    const forwarder = IForwarder__factory.connect(sWallet, this._provider);
    const nonce: BigNumber = await forwarder.nonce();

    return nonce.toString();
  }

  async getFactoryNonce(factoryAddr: string, from: string): Promise<string> {
    const factory = IForwarder__factory.connect(factoryAddr, this._provider);
    const nonce: BigNumber = await factory.connect(from).nonce();

    return nonce.toString();
  }

  async _getBlockGasLimit(): Promise<BigNumber> {
    const latestBlock = await this.provider.getBlock('latest');

    return latestBlock.gasLimit;
  }

  async validateAcceptRelayCall(
    relayRequest: EnvelopingTypes.RelayRequestStruct,
    signature: string,
    relayWorker: string
  ): Promise<{
    verifierAccepted: boolean;
    returnValue: string;
    reverted: boolean;
    revertedInDestination: boolean;
  }> {
    const relayHub = this._relayHub;
    const externalGasLimit: BigNumber = BigNumber.from(
      await this.getMaxViewableRelayGasLimit(
        relayRequest,
        signature,
        relayWorker
      )
    );
    if (externalGasLimit.eq(0)) {
      // The relayWorker does not have enough balance for this transaction
      return {
        verifierAccepted: false,
        reverted: false,
        returnValue: `relayWorker ${relayWorker} does not have enough balance to cover the maximum possible gas for this transaction`,
        revertedInDestination: false,
      };
    }

    // First call the verifier
    try {
      await this._relayVerifier
        .connect(relayWorker)
        .verifyRelayedCall(relayRequest, signature, {
          // defaultBlock: 'pending' // FIXME: suppose to be set to pending (not sure why tho?), but ethers has no such overriode
        });
    } catch ({ message }) {
      return {
        verifierAccepted: false,
        reverted: false,
        returnValue: `view call to 'relayCall' reverted in verifier: ${
          message as string
        }`,
        revertedInDestination: false,
      };
    }

    // If the verified passed, try relaying the transaction (in local view call)
    try {
      const res = await relayHub
        .connect(relayWorker)
        .relayCall(relayRequest, signature, {
          gasPrice: relayRequest.relayData.gasPrice,
          gasLimit: externalGasLimit,
        });

      // res is destinationCallSuccess
      return {
        verifierAccepted: true,
        reverted: false,
        returnValue: '',
        revertedInDestination: !res,
      };
    } catch ({ message }) {
      return {
        verifierAccepted: true,
        reverted: true,
        returnValue: `view call to 'relayCall' reverted in client: ${
          message as string
        }`,
        revertedInDestination: false,
      };
    }
  }

  async validateAcceptDeployCall(
    request: DeployTransactionRequest,
    relayWorker: string
  ): Promise<{
    verifierAccepted: boolean;
    returnValue: string;
    reverted: boolean;
  }> {
    const relayHub = this._relayHub;
    const externalGasLimit = BigNumber.from(
      await this.getMaxViewableDeployGasLimit(request, relayWorker)
    );

    const {
      relayRequest,
      metadata: { signature },
    } = request;
    const { relayData } = relayRequest;

    if (externalGasLimit.eq(0)) {
      // The relayWorker does not have enough balance for this transaction
      return {
        verifierAccepted: false,
        reverted: false,
        returnValue: `relayWorker ${relayWorker} does not have enough balance to cover the maximum possible gas for this transaction`,
      };
    }

    // First call the verifier
    try {
      await this._deployVerifier
        .connect(relayWorker)
        .verifyRelayedCall(relayRequest, signature);
    } catch ({ message }) {
      return {
        verifierAccepted: false,
        reverted: false,
        returnValue: `view call to 'deploy call' reverted in verifier: ${
          message as string
        }`,
      };
    }

    // If the verified passed, try relaying the transaction (in local view call)
    try {
      const res = await relayHub
        .connect(relayWorker)
        .deployCall(relayRequest, signature, {
          gasPrice: relayData.gasPrice,
          gasLimit: externalGasLimit,
        });

      return {
        verifierAccepted: true,
        reverted: false,
        returnValue: res.hash, //res.returnValue was the original value, but I have no idea what it is meant to be? the deployCall method does not return anything.
      };
    } catch ({ message }) {
      return {
        verifierAccepted: true,
        reverted: true,
        returnValue: `view call to 'deployCall' reverted in client: ${
          message as string
        }`,
      };
    }
  }

  async getMaxViewableDeployGasLimit(
    request: DeployTransactionRequest,
    relayWorker: string
  ): Promise<BigNumberish> {
    const { relayRequest } = request;
    const {
      relayData: { gasPrice },
    } = relayRequest;

    if (BigNumber.from(gasPrice).eq(0)) {
      return 0;
    }

    const maxEstimatedGas = await this.walletFactoryEstimateGasOfDeployCall(
      request,
      relayWorker
    );
    const workerBalanceAsUnitsOfGas = (await this.getBalance(relayWorker)).div(
      BigNumber.from(gasPrice)
    );

    return workerBalanceAsUnitsOfGas.gte(maxEstimatedGas) ? maxEstimatedGas : 0;
  }

  async estimateRelayTransactionMaxPossibleGas(
    relayRequest: EnvelopingTypes.RelayRequestStruct,
    signature: string,
    relayWorker: string
  ): Promise<BigNumber> {
    const encodedTargetCall = this._relayHub.interface.encodeFunctionData(
      'relayCall',
      [relayRequest, signature]
    );
    const maxPossibleGas = await this.provider.estimateGas({
      from: relayWorker,
      to: relayRequest.request.relayHub,
      data: encodedTargetCall,
      gasPrice: relayRequest.relayData.gasPrice,
    });

    // TODO RIF Team: Once the exactimator is available on the RSK node, then ESTIMATED_GAS_CORRECTION_FACTOR can be removed (in our tests it is 1.0 anyway, so it's not active)
    return BigNumber.from(
      FixedNumber.from(
        maxPossibleGas.mul(ESTIMATED_GAS_CORRECTION_FACTOR)
      ).ceiling()
    );
  }

  async estimateRelayTransactionMaxPossibleGasWithTransactionRequest(
    {
      metadata: { relayHubAddress, signature },
      relayRequest,
    }: RelayTransactionRequest,
    relayWorker: string
  ): Promise<BigNumber> {
    if (!relayHubAddress || relayHubAddress === constants.AddressZero) {
      throw new Error('calculateDeployCallGas: RelayHub must be defined');
    }
    const {
      relayData: { gasPrice },
    } = relayRequest;
    const rHub = IRelayHub__factory.connect(relayHubAddress, this._provider);
    const maxPossibleGas = await rHub
      .connect(relayWorker)
      .estimateGas.relayCall(relayRequest, signature, {
        gasPrice: gasPrice,
      });

    // TODO RIF Team: Once the exactimator is available on the RSK node, then ESTIMATED_GAS_CORRECTION_FACTOR can be removed (in our tests it is 1.0 anyway, so it's not active)
    return BigNumber.from(
      FixedNumber.from(
        maxPossibleGas.mul(ESTIMATED_GAS_CORRECTION_FACTOR)
      ).ceiling()
    );
  }

  async estimateDestinationContractCallGas(
    transactionDetails: EstimateGasParams,
    addCushion = true
  ): Promise<BigNumber> {
    // For relay calls, transactionDetails.gas is only the portion of gas sent to the destination contract, the tokenPayment
    // Part is done before, by the SmartWallet

    const estimated = await this.provider.estimateGas({
      from: transactionDetails.from,
      to: transactionDetails.to,
      gasPrice: transactionDetails.gasPrice as string,
      data: transactionDetails.data,
    });
    let internalCallCost = estimated.gt(
      INTERNAL_TRANSACTION_ESTIMATE_CORRECTION
    )
      ? estimated.sub(INTERNAL_TRANSACTION_ESTIMATE_CORRECTION)
      : estimated;

    // The INTERNAL_TRANSACTION_ESTIMATE_CORRECTION is substracted because the estimation is done using web3.eth.estimateGas which
    // estimates the call as if it where an external call, and in our case it will be called internally (it's not the same cost).
    // Because of this, the estimated maxPossibleGas in the server (which estimates the whole transaction) might not be enough to successfully pass
    // the following verification made in the SmartWallet:
    // require(gasleft() > req.gas, "Not enough gas left"). This is done right before calling the destination internally

    if (addCushion) {
      internalCallCost = internalCallCost.mul(ESTIMATED_GAS_CORRECTION_FACTOR);
    }

    return internalCallCost;
  }

  async getMaxViewableRelayGasLimit(
    relayRequest: EnvelopingTypes.RelayRequestStruct,
    signature: string,
    relayWorker: string
  ): Promise<BigNumberish> {
    const {
      relayData: { gasPrice },
    } = relayRequest;

    if (!BigNumber.from(gasPrice).eq(constants.Zero)) {
      0;
    }

    const maxEstimatedGas: BigNumber =
      await this.estimateRelayTransactionMaxPossibleGas(
        relayRequest,
        signature,
        relayWorker
      );
    const workerBalanceAsUnitsOfGas = (await this.getBalance(relayWorker)).div(
      gasPrice as BigNumberish
    );

    return workerBalanceAsUnitsOfGas.gte(maxEstimatedGas) ? maxEstimatedGas : 0;
  }

  encodeRelayCallABI(
    relayRequest: EnvelopingTypes.RelayRequestStruct,
    sig: string
  ): string {
    return this._relayHub.interface.encodeFunctionData('relayCall', [
      relayRequest,
      sig,
    ]);
  }

  encodeDeployCallABI(
    relayRequest: EnvelopingTypes.DeployRequestStruct,
    sig: string
  ): string {
    return this._relayHub.interface.encodeFunctionData('deployCall', [
      relayRequest,
      sig,
    ]);
  }

  async getActiveRelayInfo(
    relayManagers: Set<string>
  ): Promise<IRelayHub.RelayManagerDataStruct[]> {
    const results = await this.getRelayInfo(relayManagers);

    return results.filter(
      (relayData) => relayData.registered && relayData.currentlyStaked
    );
  }

  async getRelayInfo(
    relayManagers: Set<string>
  ): Promise<IRelayHub.RelayManagerDataStruct[]> {
    const managers: string[] = Array.from(relayManagers);
    const contractCalls: Array<Promise<IRelayHub.RelayManagerDataStruct>> =
      managers.map((managerAddress) =>
        this._relayHub.getRelayInfo(managerAddress)
      );

    return await Promise.all(contractCalls);
  }

  async getPastEventsForHub(
    { fromBlock, toBlock }: PastEventOptions, // PastEventOptions
    names: ManagerEvent[] = DEFAULT_MANAGER_EVENTS
  ): Promise<Array<TypedEvent>> {
    const eventFilters = await Promise.all(
      names.map((name) => {
        const filter = this._relayHub.filters[name];

        const definedFilter = filter() as Omit<typeof filter, 'undefined'>;

        return this._relayHub.queryFilter(definedFilter, fromBlock, toBlock);
      })
    );

    return eventFilters.flat();
  }

  async getBalance(
    address: string,
    atBlock: number | 'latest' | 'pending' | 'earliest' = 'latest'
  ): Promise<BigNumber> {
    return await this.provider.getBalance(address, atBlock);
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getTransactionCount(
    address: string,
    defaultBlock?: number | string
  ): Promise<number> {
    //  (web3 does not define 'defaultBlock' as optional)
    return await this.provider.getTransactionCount(address, defaultBlock);
  }

  async getTransaction(transactionHash: string): Promise<TransactionResponse> {
    return await this.provider.getTransaction(transactionHash);
  }

  async getBlock(blockHashOrBlockNumber: number | string): Promise<Block> {
    return await this.provider.getBlock(blockHashOrBlockNumber);
  }

  async isContractDeployed(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address);

    // Check added for RSKJ: when the contract does not exist in RSKJ it replies to the getCode call with 0x00
    return code !== '0x' && code !== '0x00';
  }

  async getStakeInfo(
    managerAddress: string
  ): Promise<ReturnType<RelayHub['getStakeInfo']>> {
    return await this._relayHub.getStakeInfo(managerAddress);
  }

  async walletFactoryDeployEstimateGasForInternalCall(
    { request, relayData }: EnvelopingTypes.DeployRequestStruct,
    factory: string,
    suffixData: string,
    feesReceiver: string,
    signature: string,
    testCall = false
  ): Promise<BigNumber | void> {
    const pFactory = IWalletFactory__factory.connect(factory, this.provider);
    if (testCall) {
      // FIXME: violates first SOLID principle
      await pFactory
        .connect(request.relayHub as string)
        .callStatic.relayedUserSmartWalletCreation(
          request,
          suffixData,
          feesReceiver,
          signature,
          {
            gasPrice: relayData.gasPrice,
          }
        );
    }

    return pFactory
      .connect(request.relayHub as string)
      .estimateGas.relayedUserSmartWalletCreation(
        request,
        suffixData,
        feesReceiver,
        signature,
        {
          gasPrice: relayData.gasPrice,
        }
      );
  }

  async walletFactoryEstimateGasOfDeployCall(
    {
      relayRequest,
      metadata: { relayHubAddress, signature },
    }: DeployTransactionRequest,
    relayWorker: string
  ): Promise<BigNumber> {
    if (!relayHubAddress || relayHubAddress === constants.AddressZero) {
      throw new Error('calculateDeployCallGas: RelayHub must be defined');
    }
    const rHub = IRelayHub__factory.connect(relayHubAddress, this.provider);

    const {
      relayData: { gasPrice },
    } = relayRequest;

    return rHub
      .connect(relayWorker)
      .estimateGas.deployCall(relayRequest, signature, { gasPrice });
  }

  async getRegisterRelayMethod(url: string): Promise<ContractTransaction> {
    return this._relayHub.registerRelayServer(url);
  }

  async getAddRelayWorkersMethod(
    workers: string[]
  ): Promise<ContractTransaction> {
    return this._relayHub.addRelayWorkers(workers);
  }

  async broadcastTransaction(
    signedTransaction: string
  ): Promise<TransactionResponse> {
    return this.provider.sendTransaction(signedTransaction);
  }

  async verifyForwarder(
    suffixData: string,
    {
      request,
      relayData: { callForwarder },
    }: EnvelopingTypes.RelayRequestStruct,
    signature: string
  ): Promise<void> {
    const forwarder = IForwarder__factory.connect(
      callForwarder as string,
      this.provider
    );
    await forwarder.verify(suffixData, request, signature);
  }
}
