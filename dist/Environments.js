"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRsk = exports.getEnvironment = exports.defaultEnvironment = exports.environments = void 0;
const defaultRelayHubConfiguration = {
    maxWorkerCount: 10,
    minimumStake: (1e18).toString(),
    minimumUnstakeDelay: 1000,
    minimumEntryDepositValue: (1e18).toString()
};
exports.environments = {
    istanbul: {
        chainId: 1,
        relayHubConfiguration: defaultRelayHubConfiguration,
        mintxgascost: 21000
    },
    constantinople: {
        chainId: 1,
        relayHubConfiguration: defaultRelayHubConfiguration,
        mintxgascost: 21000
    },
    rsk: {
        chainId: 33,
        relayHubConfiguration: defaultRelayHubConfiguration,
        mintxgascost: 21000
    }
};
exports.defaultEnvironment = exports.environments.rsk;
function getEnvironment(networkName) {
    if (networkName.startsWith('rsk')) {
        return exports.environments.rsk;
    }
    return exports.defaultEnvironment;
}
exports.getEnvironment = getEnvironment;
function isRsk(environment) {
    return environment.chainId === 33;
}
exports.isRsk = isRsk;
//# sourceMappingURL=Environments.js.map