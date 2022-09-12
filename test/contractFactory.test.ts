import { VersionRegistry, VersionRegistry__factory } from "@rsksmart/rif-relay-contracts/typechain-types"
import chai, { expect } from "chai"
// import {}   from '@nomicfoundation/hardhat-chai-matchers';
import { ContractFactory, ethers } from "ethers"
import Sinon from "sinon"
import { getContractAt } from "../src/factories/contractFactory";
import {solidity} from 'ethereum-waffle';

chai.use(solidity);

describe('contractFactory', () => {
  describe('getContractAt', () => {
    it('should get contract from address', async () =>{
      VersionRegistry__factory.abi;
      // const owner = ethers.Wallet.createRandom();
      // const versionRegistryFactory: ContractFactory = new ethers.ContractFactory(VersionRegistry__factory.abi, VersionRegistry__factory.bytecode, owner);

      // const expectedContract = await versionRegistryFactory.deploy();
      // const actualContract = getContractAt<VersionRegistry>(
      //   "VersionRegistry",
      //   expectedContract.address,
      //   owner
      // );

      // expect(actualContract.addVersion(ethers.utils.id("test"),ethers.utils.id("v0.0.1"),"")).to.emit(expectedContract, 'VersionAdded');
    })
  })
})