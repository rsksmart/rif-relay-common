import ow from 'ow';
import type {
  EnvelopingTypes
} from '@rsksmart/rif-relay-contracts';


export interface RelayMetadata {
  relayHubAddress: string;
  relayMaxNonce: number;
  signature: string;
}

export interface RelayTransactionRequest {
  relayRequest: EnvelopingTypes.RelayRequestStruct;
  metadata: RelayMetadata;
}

export interface DeployTransactionRequest {
  relayRequest: EnvelopingTypes.DeployRequestStruct;
  metadata: RelayMetadata;
}

export const deployTransactionRequestShape = {
  relayRequest: {
    request: {
      relayHub: ow.string,
      from: ow.string,
      to: ow.string,
      value: ow.string,
      nonce: ow.string,
      data: ow.string,
      tokenContract: ow.string,
      tokenAmount: ow.string,
      tokenGas: ow.string,
      recoverer: ow.string,
      index: ow.string,
    },
    relayData: {
      gasPrice: ow.string,
      relayWorker: ow.string,
      callForwarder: ow.string,
      callVerifier: ow.string,
    },
  },
  metadata: {
    relayHubAddress: ow.string,
    relayMaxNonce: ow.number,
    signature: ow.string,
  },
};

export const relayTransactionRequestShape = {
  relayRequest: {
    request: {
      relayHub: ow.string,
      from: ow.string,
      to: ow.string,
      value: ow.string,
      gas: ow.string,
      nonce: ow.string,
      data: ow.string,
      tokenContract: ow.string,
      tokenAmount: ow.string,
      tokenGas: ow.string,
    },
    relayData: {
      gasPrice: ow.string,
      relayWorker: ow.string,
      callForwarder: ow.string,
      callVerifier: ow.string,
    },
  },
  metadata: {
    relayHubAddress: ow.string,
    relayMaxNonce: ow.number,
    signature: ow.string,
  },
};
