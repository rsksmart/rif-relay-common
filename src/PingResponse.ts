export default interface PingResponse {
    relayWorkerAddress: string;
    relayManagerAddress: string;
    relayHubAddress: string;
    collectorAddress?: string;
    minGasPrice: string;
    networkId?: string;
    chainId?: string;
    ready: boolean;
    version: string;
}
