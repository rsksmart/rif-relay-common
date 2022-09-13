import * as contracts from '@rsksmart/rif-relay-contracts/dist/typechain-types';
import { BaseContract, Contract } from 'ethers';
import type { ContractName, SignerOrProvider } from '../types';

/**
 * Creates an instance of the given contract type and connects to deployed contract at address
 * @param addressOrName address of the deployed contract
 */
// const getContractAt = <C extends BaseContract>(
//   addressOrName: string,
//   contractInterface: ContractInterface,
//   signerOrProvider: SignerOrProvider
// ) => ;

/**
 * Locates abi and creates new contract at an address.
 */
export const getContractAt = <C extends BaseContract>(
  contractName: ContractName,
  address: string,
  signerOrProvider: SignerOrProvider
): C => {
  const contractAbi = contracts[`${contractName}__factory`]?.abi;
  if (!contractAbi) {
    throw new Error('Unknown contract');
  }

  return new Contract(address, contractAbi, signerOrProvider) as C;
};
