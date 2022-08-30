import { stubInterface } from 'ts-sinon';
import { stub } from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import { ERC20Instance } from '@rsksmart/rif-relay-contracts/types/truffle-contracts';
import { use, assert } from 'chai';
import BN from 'bn.js';
import { ContractInteractor, EnvelopingConfig, Web3Provider } from '../src';
import Token from '../src/types/token.type';

const DEFAULT_CHAIN_ID = 33;

use(chaiAsPromised);

describe('ContractInteractor', () => {
    let contractInteractor: ContractInteractor;
    const defaultConfig: EnvelopingConfig = {
        chainId: DEFAULT_CHAIN_ID
    } as EnvelopingConfig;
    const address = 'address';

    beforeEach(() => {
        const mockWeb3Provider = stubInterface<Web3Provider>();
        contractInteractor = new ContractInteractor(
            mockWeb3Provider,
            defaultConfig
        );
    });

    describe('getERC20Token', () => {
        it('should return testToken', async () => {
            const testToken: Token = {
                name: 'Test Token',
                decimals: 18,
                symbol: 'TKN',
                contractAddress: address
            };

            const fakeERC20Instance = stubInterface<ERC20Instance>({
                name: Promise.resolve(testToken.name),
                symbol: Promise.resolve(testToken.symbol),
                decimals: Promise.resolve(new BN(testToken.decimals))
            });
            stub(contractInteractor, '_createERC20')
                .withArgs(address)
                .returns(Promise.resolve(fakeERC20Instance));

            const token = await contractInteractor.getERC20Token(address);
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
        });

        it('should fail if address is null', async () => {
            await assert.isRejected(
                contractInteractor.getERC20Token(null),
                'Invalid address passed to ERC20.at(): null'
            );
        });
    });
});
