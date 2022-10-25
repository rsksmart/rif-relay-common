import { ERC20Instance } from '@rsksmart/rif-relay-contracts/types/truffle-contracts';

type TokenAttributes = {
    name: string;
    decimals: number;
    symbol: string;
};

export type ERC20Token = Partial<TokenAttributes> & {
    instance: ERC20Instance;
};

type OptionsFlags<Type> = {
    [Property in keyof Type]: boolean;
};

export type ERC20Options = Partial<OptionsFlags<TokenAttributes>>;
