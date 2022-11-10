import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  IForwarder,
  IForwarder__factory,
  RelayHub__factory,
} from '@rsksmart/rif-relay-contracts';
import type { EnvelopingTypes, RelayHub } from '@rsksmart/rif-relay-contracts';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { constants, ethers } from 'ethers';
import { createSandbox, SinonStubbedInstance } from 'sinon';
import sinonChai from 'sinon-chai';
import ContractInteractor from '../src/ContractInteractor';
import VersionsManager from '../src/VersionsManager';
import type { EnvelopingConfig } from '../types/EnvelopingConfig';

const sandbox = createSandbox();

use(sinonChai);
use(chaiAsPromised);

const GAS_PRICE_PERCENT = 0;
const MAX_RELAY_NONCE_GAP = 3;
const DEFAULT_RELAY_TIMEOUT_GRACE_SEC = 1800;
const DEFAULT_LOOKUP_WINDOW_BLOCKS = 60000;
const DEFAULT_CHAIN_ID = 33;
const ADDRESS_ZERO = constants.AddressZero;

describe('ContractInteractor', function () {
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
    relayHubAddress: ADDRESS_ZERO,
    deployVerifierAddress: ADDRESS_ZERO,
    relayVerifierAddress: ADDRESS_ZERO,
    forwarderAddress: ADDRESS_ZERO,
    smartWalletFactoryAddress: ADDRESS_ZERO,
    logLevel: 0,
    clientId: '1',
  };
  let fakeProvider: SinonStubbedInstance<JsonRpcProvider>;
  let contractInteractor: ContractInteractor;

  beforeEach(async function () {
    const fakeSigner = ethers.Wallet.createRandom() as unknown as JsonRpcSigner;

    fakeProvider = sandbox.createStubInstance(JsonRpcProvider, {
      getSigner: sandbox
        .stub<[string | number | undefined], JsonRpcSigner>()
        .callsFake(() => fakeSigner),
    });
    // FIXME: somehow make it run without ignoring ts rules (ie without changing readonly _isProvider)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fakeProvider._isProvider = true;

    sandbox
      .stub(VersionsManager.prototype, 'isMinorSameOrNewer')
      .callsFake(() => true);

    sandbox.stub(RelayHub__factory, 'connect').callsFake(
      () =>
        ({
          versionHub: () => {
            return 666;
          },
        } as unknown as RelayHub)
    );

    contractInteractor = await ContractInteractor.getInstance(
      fakeProvider,
      defaultConfig
    );
  });

  afterEach(function () {
    sandbox.restore();
  });
  after(function () {
    sandbox.restore();
  });

  describe('verifyForwarder', function () {
    const fakeSuffixData = 'fakeSuffix';
    const fakeRelayRequest: EnvelopingTypes.RelayRequestStruct = {
      request: {
        to: 'fake_address',
        data: 'fake_data',
        gas: '1',
      } as IForwarder.ForwardRequestStruct,
      relayData: {
        gasPrice: '0',
        callForwarder: 'fake_address',
      } as EnvelopingTypes.RelayDataStruct,
    };
    const fakeSignature = 'fake_signature';

    const fakeForwarder: IForwarder = <IForwarder>(<unknown>{});
    beforeEach(function () {
      sandbox
        .stub(IForwarder__factory, 'connect')
        .callsFake(() => fakeForwarder);

      fakeForwarder.verify = sandbox.stub();
    });

    it('should verify EOA', async function () {
      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          fakeRelayRequest,
          fakeSignature
        )
      ).to.eventually.be.undefined;
    });

    // FIXME: all following tests seem to be integration tests as they expect some behaviour from dependencies.
    it('should fail if EOA is not the owner', async function () {
      const expectedErrorMsg =
        'VM Exception while processing transaction: revert Not the owner of the SmartWallet'; // TODO: extract to error.constants.ts
      fakeForwarder.verify = () => {
        throw Error(expectedErrorMsg);
      };

      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          fakeRelayRequest,
          fakeSignature
        )
      ).to.have.eventually.rejectedWith(expectedErrorMsg);
    });

    it('should fail if nonce mismatch', async function () {
      const expectedErrorMsg =
        'VM Exception while processing transaction: revert nonce mismatch'; // TODO: extract to error.constants.ts
      fakeForwarder.verify = () => {
        throw Error(expectedErrorMsg);
      };

      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          fakeRelayRequest,
          fakeSignature
        )
      ).to.have.eventually.rejectedWith(expectedErrorMsg);
    });

    it('should fail if signature mismatch', async function () {
      const expectedErrorMsg =
        'VM Exception while processing transaction: revert Signature mismatch'; // TODO: extract to error.constants.ts
      fakeForwarder.verify = () => {
        throw Error(expectedErrorMsg);
      };

      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          fakeRelayRequest,
          fakeSignature
        )
      ).to.have.eventually.rejectedWith(expectedErrorMsg);
    });

    it('should fail if suffixData is undefined', async function () {
      const expectedErrorMsg =
        "Cannot read properties of undefined (reading 'substring')"; // TODO: extract to error.constants.ts
      fakeForwarder.verify = () => {
        throw Error(expectedErrorMsg);
      };

      await expect(
        contractInteractor.verifyForwarder(
          undefined as unknown as string,
          fakeRelayRequest,
          fakeSignature
        )
      ).to.have.eventually.rejectedWith(expectedErrorMsg);
    });

    it('should fail if RelayRequest is undefined', async function () {
      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          undefined as unknown as EnvelopingTypes.RelayRequestStruct,
          fakeSignature
        )
      ).to.have.eventually.rejectedWith();
    });

    it('should fail if Signature is undefined', async function () {
      const expectedErrorMsg =
        "Cannot read properties of undefined (reading 'length')"; // TODO: extract to error.constants.ts
      fakeForwarder.verify = () => {
        throw Error(expectedErrorMsg);
      };

      await expect(
        contractInteractor.verifyForwarder(
          fakeSuffixData,
          fakeRelayRequest,
          undefined as unknown as string
        )
      ).to.have.eventually.rejectedWith(expectedErrorMsg);
    });
  });
});
