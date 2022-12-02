import { PrefixedHexString } from 'ethereumjs-tx';

export default interface EnvelopingTransactionDetails {
    // Added by the Web3 call stack:
    readonly from: string;
    readonly data: PrefixedHexString;
    readonly to: string;
    readonly tokenContract?: string;
    readonly tokenAmount?: string;
    tokenGas?: string;
    readonly recoverer?: string;
    readonly index?: string;
    readonly value?: string;

    /**
     * TODO: this is horrible. Think about it some more
     * Do not set this value manually as this value will be overwritten. Use {@link forceGasPrice} instead.
     */
    gas?: PrefixedHexString;
    gasPrice?: PrefixedHexString;

    // Required parameters for Enveloping, but assigned later
    readonly relayHub?: string;
    readonly callForwarder?: string;
    readonly callVerifier?: string;
    readonly isSmartWalletDeploy?: boolean;
    smartWalletAddress?: string;

    readonly clientId?: string;

    // Optional parameters for RelayProvider only:
    /**
     * Set to 'false' to create a direct transaction
     */
    readonly useEnveloping?: boolean;

    /**
     * Use this to force the {@link RelayClient} to use provided gas price instead of calculated one.
     */
    readonly forceGasPrice?: PrefixedHexString;

    /**
     * Use this to force the {@link RelayProvider} to use provided gas instead of the one estimated by the {@link RelayClient}.
     */
    readonly forceGas?: PrefixedHexString;

    /**
     * Use this to force the RelayClient to use only the preferred relays when searching for a suitable relay server
     */
    readonly onlyPreferredRelays?: boolean;

    /**
     * Use this to wait for the transaction receipt while processing a transaction
     */
    readonly ignoreTransactionReceipt?: boolean;

    retries?: number;
    initialBackoff?: number;
    validUntilTime: string;
}
