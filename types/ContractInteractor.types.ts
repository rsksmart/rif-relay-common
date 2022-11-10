import type {
    RelayHub
  } from '@rsksmart/rif-relay-contracts';

export type EstimateGasParams = {
    from: string;
    to: string;
    data: string;
    gasPrice?: string;
}

export type PastEventOptions = {
    fromBlock?: number;
    toBlock?: number | string | 'latest' | 'pending' | 'earliest' | 'genesis';
}

export type ManagerEvent = keyof RelayHub['filters'];
export type DefaultManagerEvent = Extract<
  ManagerEvent,
  | 'RelayServerRegistered'
  | 'RelayWorkersAdded'
  | 'TransactionRelayed'
  | 'TransactionRelayedButRevertedByRecipient'

>;

