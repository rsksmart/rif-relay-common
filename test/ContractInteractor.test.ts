import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
// import {IForwarder} from '@rsksmart/rif-relay-contracts/typechain-types/contracts/interfaces';
// import {
//     constants,
//     ContractInteractor,
//     EnvelopingConfig,
//     Web3Provider
// } from '../src';

use(sinonChai);
use(chaiAsPromised);

// const GAS_PRICE_PERCENT = 0;
// const MAX_RELAY_NONCE_GAP = 3;
// const DEFAULT_RELAY_TIMEOUT_GRACE_SEC = 1800;
// const DEFAULT_LOOKUP_WINDOW_BLOCKS = 60000;
// const DEFAULT_CHAIN_ID = 33;

describe('ContractInteractor', function() {
    // const defaultConfig: EnvelopingConfig = {
    //     preferredRelays: [],
    //     onlyPreferredRelays: false,
    //     relayLookupWindowParts: 1,
    //     relayLookupWindowBlocks: DEFAULT_LOOKUP_WINDOW_BLOCKS,
        
        
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             )
    //         ).to.eventually.be.undefined;
    //         expect(contractInteractor._createForwarder).to.have.been.calledOnce;
    //     });

    //     it('should fail if EOA is not the owner', async () => {
    //         const error = new TypeError(
    //             'VM Exception while processing transaction: revert Not the owner of the SmartWallet'
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if nonce mismatch', async () => {
    //         const error = new TypeError(
    //             'VM Exception while processing transaction: revert nonce mismatch'
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if signature mismatch', async () => {
    //         const error = new TypeError(
    //             'VM Exception while processing transaction: revert Signature mismatch'
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if suffixData is null', async () => {
    //         const error = new TypeError(
    //             "Cannot read properties of null (reading 'substring')"
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 null,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if RelayRequest is null', async () => {
    //         const error = new TypeError(
    //             "Cannot read properties of null (reading 'relayData')"
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 null,
    //                 fakeSignature
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if Signature is null', async () => {
    //         const error = new TypeError(
    //             "Cannot read properties of null (reading 'length')"
    //         );
    //         fakeIForwarder.verify.throwsException(error);
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 null
    //             ),
    //             error.message
    //         );
    //     });

    //     it('should fail if callForwarder is null', async () => {
    //         _createForwarderStub.restore();
    //         fakeRelayRequest.relayData.callForwarder = null;
    //         await assert.isRejected(
    //             contractInteractor.verifyForwarder(
    //                 fakeSuffixData,
    //                 fakeRelayRequest,
    //                 fakeSignature
    //             ),
    //             'Invalid address passed to IForwarder.at(): null'
    //         );
    //     });
    // });
});
