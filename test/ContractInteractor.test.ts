import { expect, use, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { constants } from 'ethers';
import {BaseProvider} from '@ethersproject/providers/lib'
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import ContractInteractor from '../src/ContractInteractor';
import type { EnvelopingConfig } from '../types/EnvelopingConfig';
import type {EnvelopingTypes} from '@rsksmart/rif-relay-contracts/dist/typechain-types/contracts/RelayHub';
import type {IForwarder} from "@rsksmart/rif-relay-contracts/dist/typechain-types"

use(sinonChai);
use(chaiAsPromised);

const GAS_PRICE_PERCENT = 0;
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
        relayHubAddress: constants.AddressZero,
        deployVerifierAddress: constants.AddressZero,
        relayVerifierAddress: constants.AddressZero,
        forwarderAddress: constants.AddressZero,
        smartWalletFactoryAddress: constants.AddressZero,
        logLevel: 0,
        clientId: '1'
    };
    let fakeProvider: BaseProvider;
    let contractInteractor: ContractInteractor;

    before(() => {
        fakeProvider = sinon.createStubInstance(BaseProvider);
        contractInteractor = new ContractInteractor(
            fakeProvider,
            defaultConfig
        );
    });

    describe('verifyForwarder', () => {
        let _createForwarderStub: sinon.SinonStub;
        let fakeIForwarderInstance: sinon.SinonStubbedInstance<IForwarder> &
        IForwarder;
        const fakeSuffixData = 'fakeSuffix';
        const fakeRelayRequest: EnvelopingTypes.RelayRequestStruct = {
            request: {
                to: 'fake_address',
                data: 'fake_data',
                gas: '1'
            } as IForwarder.ForwardRequestStruct,
            relayData: {
                gasPrice: '0',
                callForwarder: 'fake_address'
            } as EnvelopingTypes.RelayDataStruct
        };
        const fakeSignature = 'fake_signature';

        before(() => {
            fakeIForwarderInstance = sinon.createStubInstance(sinon.stub());
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

        it('should fail if suffixData is undefined', async () => {
            const error = new TypeError(
                "Cannot read properties of undefined (reading 'substring')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    undefined as unknown as string,
                    fakeRelayRequest,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if RelayRequest is undefined', async () => {
            const error = new TypeError(
                "Cannot read properties of undefined (reading 'relayData')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    undefined as unknown as EnvelopingTypes.RelayRequestStruct,
                    fakeSignature
                ),
                error.message
            );
        });

        it('should fail if Signature is undefined', async () => {
            const error = new TypeError(
                "Cannot read properties of undefined (reading 'length')"
            );
            fakeIForwarderInstance.verify.throwsException(error);
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    undefined as unknown as string
                ),
                error.message
            );
        });

        it('should fail if callForwarder is undefined', async () => {
            _createForwarderStub.restore();
            fakeRelayRequest.relayData.callForwarder = undefined as unknown as string;
            await assert.isRejected(
                contractInteractor.verifyForwarder(
                    fakeSuffixData,
                    fakeRelayRequest,
                    fakeSignature
                ),
                'Invalid address passed to IForwarder.at(): undefined'
            );
        });
    });
});
