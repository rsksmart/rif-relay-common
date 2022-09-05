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
