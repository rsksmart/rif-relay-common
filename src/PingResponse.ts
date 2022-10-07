export default interface PingResponse {
    relayWorkerAddress: string;
    relayManagerAddress: string;
    relayHubAddress: string;
    feesReceiver: string;
    minGasPrice: string;
    networkId?: string;
    chainId?: string;
    ready: boolean;
    version: string;
}
