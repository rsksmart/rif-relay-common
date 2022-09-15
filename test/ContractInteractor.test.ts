import sinon, { stubInterface } from 'ts-sinon';
import { SinonStub, stub } from 'sinon';
import { expect, use, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import BN from 'bn.js';
import {
    IForwarderInstance,
    ERC20Instance
} from '@rsksmart/rif-relay-contracts/types/truffle-contracts';
import {
    constants,
    ContractInteractor,
    EnvelopingConfig,
    Web3Provider
} from '../src';
import { Token } from '../src/types/token.type';
import {
    ForwardRequest,
    RelayData,
    RelayRequest
} from '@rsksmart/rif-relay-contracts';

use(sinonChai);
use(chaiAsPromised);

const GAS_PRICE_PERCENT = 0; //
const MAX_RELAY_NONCE_GAP = 3;
const DEFAULT_RELAY_TIMEOUT_GRACE_SEC = 1800;
const DEFAULT_LOOKUP_WINDOW_BLOCKS = 60000;
const DEFAULT_CHAIN_ID = 33;

describe('ContractInteractor', () => {
    const defaultConfig: EnvelopingConfig = {
        preferredRelays: [],
        onlyPreferredRelays: false,
        relayLookupWindowParts: 1,
        relayLookupWindowBlocks: DEFAULT_LOOKUP_WINDOW_BLOCKS,
        gasPriceFactorPercent: GAS_PRICE_PERCENT,
        minGasPrice: 60000000, // 0.06 GWei
        maxRelayNonceGap: MAX_RELAY_NONCE_GAP,
        sliceSize: 3,
        relayTimeoutGrace: DEFAULT_RELAY_TIMEOUT_GRACE_SEC,
        methodSuffix: '',
        jsonStringifyRequest: false,
        chainId: DEFAULT_CHAIN_ID,
        relayHubAddress: constants.ZERO_ADDRESS,
        deployVerifierAddress: constants.ZERO_ADDRESS,
        relayVerifierAddress: constants.ZERO_ADDRESS,
        forwarderAddress: constants.ZERO_ADDRESS,
        smartWalletFactoryAddress: constants.ZERO_ADDRESS,
        logLevel: 0,
        clientId: '1'
    };
    let mockWeb3Provider: Web3Provider;
    let contractInteractor: ContractInteractor;
    const address = 'address';

    before(() => {
        mockWeb3Provider = stubInterface<Web3Provider>();
        contractInteractor = new ContractInteractor(
            mockWeb3Provider,
            defaultConfig
        );
    });

    describe('verifyForwarder', () => {
        let _createForwarderStub: sinon.SinonStub;
        let fakeIForwarderInstance: sinon.SinonStubbedInstance<IForwarderInstance> &
            IForwarderInstance;
        const fakeSuffixData = 'fakeSuffix';
        const fakeRelayRequest: RelayRequest = {
            request: {
                to: 'fake_address',
                data: 'fake_data',
                gas: '1'
            } as ForwardRequest,
            relayData: {
                gasPrice: '0',
                callForwarder: 'fake_address'
            } as RelayData
        };
        const fakeSignature = 'fake_signature';

        before(() => {
            fakeIForwarderInstance = stubInterface<IForwarderInstance>();
            _createForwarderStub = sinon
                .stub(contractInteractor, '_createForwarder')
                .callsFake(() => Promise.resolve(fakeIForwarderInstance));
        });

        it('should verify EOA and call once _createForwarder', async () => {
            await expect(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                )
            ).to.eventually.be.undefined;
            expect(contractInteractor._createForwarder).to.have.been.calledOnce;
        });

        it('should fail if EOA is not the owner', async () => {
            const error = new TypeError(
                'VM Exception while processing transaction: revert Not the owner of the SmartWallet'
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if nonce mismatch', async () => {
            const error = new TypeError(
                'VM Exception while processing transaction: revert nonce mismatch'
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if signature mismatch', async () => {
            const error = new TypeError(
                'VM Exception while processing transaction: revert Signature mismatch'
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if suffixData is null', async () => {
            const error = new TypeError(
                "Cannot read properties of null (reading 'substring')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    null,
                    fakeRelayRequest,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if RelayRequest is null', async () => {
            const error = new TypeError(
                "Cannot read properties of null (reading 'relayData')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    null,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if Signature is null', async () => {
            const error = new TypeError(
                "Cannot read properties of null (reading 'length')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    null
                ),
                error.message
            );
        });

        it('should fail if callForwarder is null', async () => {
            _createForwarderStub.restore();
            fakeRelayRequest.relayData.callForwarder = null;
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                ),
                'Invalid address passed to IForwarder.at(): null'
            );
        });
    });

    describe('getERC20Token', () => {
        const testToken: Token = {
            name: 'Test Token',
            decimals: 18,
            symbol: 'TKN',
            contractAddress: address
        };

        it('should return testToken', async () => {
            const fakeERC20Instance = stubInterface<ERC20Instance>({
                name: Promise.resolve(testToken.name),
                symbol: Promise.resolve(testToken.symbol!),
                decimals: Promise.resolve(new BN(testToken.decimals!))
            });
            stub(contractInteractor, '_createERC20')
                .withArgs(address)
                .returns(Promise.resolve(fakeERC20Instance));

            const token = await contractInteractor.getERC20Token(address, {
                symbol: true,
                decimals: true
            });
            assert.equal(token.name, testToken.name, 'Token name mismatch');
            assert.equal(
                token.decimals,
                testToken.decimals,
                'Token decimals mismatch'
            );
            assert.equal(
                token.symbol,
                testToken.symbol,
                'Token symbol mismatch'
            );
            (contractInteractor._createERC20 as SinonStub).restore();
        });

        it('should return token with specified properties', async () => {
            const fakeERC20Instance = stubInterface<ERC20Instance>({
                name: Promise.resolve(testToken.name),
                symbol: Promise.resolve(testToken.symbol!),
                decimals: Promise.resolve(new BN(testToken.decimals!))
            });
            stub(contractInteractor, '_createERC20')
                .withArgs(address)
                .returns(Promise.resolve(fakeERC20Instance));

            const token = await contractInteractor.getERC20Token(address);
            assert.equal(token.name, testToken.name, 'Token name mismatch');
            assert.equal(
                token.decimals,
                undefined,
                'Token decimals should be undefined'
            );
            assert.equal(
                token.symbol,
                undefined,
                'Token symbol should be undefined'
            );
            (contractInteractor._createERC20 as SinonStub).restore();
        });

        it('should fail if address is null', async () => {
            await assert.isRejected(
                contractInteractor.getERC20Token(null),
                'Invalid address passed to ERC20.at(): null'
            );
        });
    });
});
