export type Token = {
    name: string;
    decimals?: number;
    symbol?: string;
    contractAddress: string;
};

export type TokenOptions = {
    decimals?: boolean;
    symbol?: boolean;
};
