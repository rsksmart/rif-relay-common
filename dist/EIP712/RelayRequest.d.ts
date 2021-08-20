import EIP712RelayData from './RelayData';
import { ForwardRequest, DeployRequestStruct } from './ForwardRequest';
export interface RelayRequest {
    request: ForwardRequest;
    relayData: EIP712RelayData;
}
export interface DeployRequest {
    request: DeployRequestStruct;
    relayData: EIP712RelayData;
}
export declare function cloneRelayRequest(relayRequest: RelayRequest): RelayRequest;
export declare function cloneDeployRequest(deployRequest: DeployRequest): DeployRequest;
