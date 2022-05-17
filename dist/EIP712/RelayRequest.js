"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeployRequest = exports.cloneRelayRequest = void 0;
function cloneRelayRequest(relayRequest) {
    return {
        request: Object.assign({}, relayRequest.request),
        relayData: Object.assign({}, relayRequest.relayData)
    };
}
exports.cloneRelayRequest = cloneRelayRequest;
function cloneDeployRequest(deployRequest) {
    return {
        request: Object.assign({}, deployRequest.request),
        relayData: Object.assign({}, deployRequest.relayData)
    };
}
exports.cloneDeployRequest = cloneDeployRequest;
//# sourceMappingURL=RelayRequest.js.map