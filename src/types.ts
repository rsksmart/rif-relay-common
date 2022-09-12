import * as contracts from '@rsksmart/rif-relay-contracts/typechain-types';
import { Provider } from '@ethersproject/providers';
import { ContractTransaction, Signer } from 'ethers';

/**
 * Response retrieved for each sdk call:
 *
 *  T: the method return type.
 *  Transaction Receipt.
 *
 */
export type ContractResponse<T = never> = Promise<ContractTransaction | T>;

export type SignerOrProvider = Signer | Provider;

export type FactoryName = Extract<keyof typeof contracts, `${string}__factory`>;
export type ContractName = FactoryName extends `${infer Prefix}__factory`
  ? Prefix
  : never;

export type ContractABI = typeof contracts[FactoryName]['abi'];
