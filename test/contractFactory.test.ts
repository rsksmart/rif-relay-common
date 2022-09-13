import {
  VersionRegistry,
  VersionRegistry__factory,
} from '@rsksmart/rif-relay-contracts/dist/typechain-types';
import chai, { expect } from 'chai';
// import {}   from '@nomicfoundation/hardhat-chai-matchers';
import { ContractFactory, ethers } from 'ethers';
import { getContractAt } from '../src/factories/contractFactory';
import { solidity } from 'ethereum-waffle';

chai.use(solidity);

describe('contractFactory', function() {
  describe('getContractAt', function() {
    it('should get contract from address', async function() {
      VersionRegistry__factory.abi;
      const owner = ethers.Wallet.createRandom();
      const versionRegistryFactory: ContractFactory =
        new ethers.ContractFactory(
          VersionRegistry__factory.abi,
          VersionRegistry__factory.bytecode,
          owner
        );

      const expectedContract = await versionRegistryFactory.deploy();
      const actualContract = getContractAt<VersionRegistry>(
        'VersionRegistry',
        expectedContract.address,
        owner
      );

      await expect(
        actualContract.addVersion(
          ethers.utils.id('test'),
          ethers.utils.id('v0.0.1'),
          ''
        )
      ).to.emit(expectedContract, 'VersionAdded');
    });
  });
});
