import {
    IVersionRegistry,
    VersionRegistry__factory
} from '@rsksmart/rif-relay-contracts/dist/typechain-types';
import { Signer, ethers } from 'ethers';
import { PrefixedHexString } from 'ethereumjs-tx';
import { bufferToHex } from 'ethereumjs-util';

export class VersionRegistry {
    private readonly _addr: string;
    private readonly _signer: Signer;

    constructor(signer: Signer, registryAddr: string) {
        this._addr = registryAddr;
        this._signer = signer;
    }

    connect(): IVersionRegistry {
        return VersionRegistry__factory.connect(this._addr, this._signer);
    }

    async isValid(): Promise<boolean> {
        // validate the contract exists, and has the registry API
        // Check added for RSKJ: when the contract does not exist in RSKJ it replies to the getCode call with 0x00
        const code = await ethers
            .getDefaultProvider()
            .getCode(this.connect().address);
        if (code === '0x' || code === '0x00') {
            return false;
        }
        // this check return 'true' only for owner
        // return this.registryContract.methods.addVersion('0x414243', '0x313233', '0x313233').estimateGas(this.sendOptions)
        //   .then(() => true)
        //   .catch(() => false)
        return true;
    }

    /**
     * return the latest "mature" version from the registry
     *
     * @dev: current time is last block's timestamp. This resolves any client time-zone discrepancies,
     *  but on local ganache, note that the time doesn't advance unless you mine transactions.
     *
     * @param id object id to return a version for
     * @param delayPeriod - don't return entries younger than that (in seconds)
     * @param optInVersion - if set, return this version even if it is young
     * @return version info that include actual version used, its timestamp and value.
     */
    async getVersion(
        id: string,
        delayPeriod: number,
        optInVersion = ''
    ): Promise<any> {
        const [versions, now] = await Promise.all([
            this.getAllVersions(id),
            ethers
                .getDefaultProvider()
                .getBlock('latest')
                .then((block) => block.timestamp as number)
        ]);

        const version = versions.find(
            (single_version: {
                canceled: boolean;
                time: number;
                version: string;
            }) =>
                !single_version.canceled &&
                (single_version.time + delayPeriod <= now ||
                    single_version.version === optInVersion)
        );
        if (version == null) {
            throw new Error(`getVersion(${id}) - no version found`);
        }

        return version;
    }

    /**
     * return all version history of the given id
     * @param id object id to return version history for
     */
    async getAllVersions(id: string): Promise<any[]> {
        const events = await this.connect().getPastEvents('allEvents', {
            fromBlock: 1,
            topics: [null, string32(id)]
        });
        // map of ver=>reason, for every canceled version
        const cancelReasons: { [key: string]: string } = events
            .filter((e: { event: string }) => e.event === 'VersionCanceled')
            .reduce(
                (
                    set: any,
                    e: { returnValues: { version: any; reason: any } }
                ) => ({
                    ...set,
                    [e.returnValues.version]: e.returnValues.reason
                }),
                {}
            );

        const found = new Set<string>();
        return events
            .filter((e: { event: string }) => e.event === 'VersionAdded')
            .map(
                (e: {
                    returnValues: {
                        version: string | number;
                        value: any;
                        time: string;
                    };
                }) => ({
                    version: bytes32toString(e.returnValues.version.toString()),
                    canceled: cancelReasons[e.returnValues.version] != null,
                    cancelReason: cancelReasons[e.returnValues.version],
                    value: e.returnValues.value,
                    time: parseInt(e.returnValues.time)
                })
            )
            .filter((e: { version: string }) => {
                // use only the first occurrence of each version
                if (found.has(e.version)) {
                    return false;
                } else {
                    found.add(e.version);
                    return true;
                }
            })
            .reverse();
    }

    // return all IDs registered
    async listIds(): Promise<string[]> {
        const events = await this.connect().getPastEvents('VersionAdded', {
            fromBlock: 1
        });
        const ids: Set<string> = new Set(
            events.map((event: { returnValues: { id: string } }) =>
                bytes32toString(event.returnValues.id)
            )
        );
        return Array.from(ids);
    }

    async addVersion(
        id: string,
        version: string,
        value: string,
        sendOptions = {}
    ): Promise<void> {
        await this.checkVersion(id, version, false);
        await this.connect().addVersion(string32(id), string32(version), value);
        // .send({ ...this.sendOptions, ...sendOptions });
    }

    async cancelVersion(
        id: string,
        version: string,
        cancelReason = '',
        sendOptions = {}
    ): Promise<void> {
        await this.checkVersion(id, version, true);
        await this.connect().cancelVersion(
            string32(id),
            string32(version),
            cancelReason
        );
        // .send({ ...this.sendOptions, ...sendOptions });
    }

    private async checkVersion(
        id: string,
        version: string,
        validateExists: boolean
    ): Promise<void> {
        const versions = await this.getAllVersions(id).catch(() => []);
        if (
            (versions.find((v) => v.version === version) != null) !==
            validateExists
        ) {
            throw new Error(
                `version ${
                    validateExists ? 'does not exist' : 'already exists'
                }: ${id} @ ${version}`
            );
        }
    }
}

export function string32(s: string): PrefixedHexString {
    return bufferToHex(Buffer.from(s)).padEnd(66, '0');
}

// convert a bytes32 into a string, removing any trailing zeros
export function bytes32toString(s: string): string {
    return Buffer.from(
        s.replace(/^(?:0x)?(.*?)(00)*$/, '$1'),
        'hex'
    ).toString();
}
