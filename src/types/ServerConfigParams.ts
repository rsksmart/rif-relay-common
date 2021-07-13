import { LogLevelNumbers } from 'loglevel'

export interface ServerConfigParams {
    url: string
    port: number
    versionRegistryAddress: string
    versionRegistryDelayPeriod?: number
    relayHubId?: string
    relayHubAddress: string
    rskNodeUrl: string
    workdir: string
    checkInterval: number
    readyTimeout: number
    devMode: boolean
    customReplenish: boolean
    registrationBlockRate: number
    alertedBlockDelay: number
    minAlertedDelayMS: number
    maxAlertedDelayMS: number
    trustedVerifiers: string[]
    gasPriceFactor: number
    logLevel: LogLevelNumbers
    deployVerifierAddress: string
    relayVerifierAddress: string
    workerMinBalance: number
    workerTargetBalance: number
    managerMinBalance: number
    managerMinStake: string
    managerTargetBalance: number
    minHubWithdrawalBalance: number
    refreshStateTimeoutBlocks: number
    pendingTransactionTimeoutBlocks: number
    successfulRoundsForReady: number
    confirmationsNeeded: number
    retryGasPriceFactor: number
    maxGasPrice: string
    defaultGasLimit: number
    estimateGasFactor: number
}
