import { BigNumber } from 'ethers';
// const SHA3_NULL_S: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'; // The following constants must be updated accordingly whenever RSKJ updates them // wtd lol
// const TRANSACTION_CREATE_CONTRACT_GAS_COST: 53000;
// const TRANSACTION_GAS_COST: 21000;
// const  TX_ZERO_DATA_GAS_COST: 4;
// const TX_NO_ZERO_DATA_GAS_COST: 68;

export const MAX_ESTIMATED_GAS_DEVIATION = '0.2';
export const ESTIMATED_GAS_CORRECTION_FACTOR: BigNumber = BigNumber.from(1); // TODO: if needed put a correction factor to mitigate RSK node gas miscalculation if execution includes refunds
export const INTERNAL_TRANSACTION_ESTIMATE_CORRECTION: BigNumber =
  BigNumber.from(20000); // When estimating the gas an internal call is going to spend; we need to substract some gas inherent to send the parameters to the blockchain
// export const WAIT_FOR_RECEIPT_RETRIES = 6;
// export const WAIT_FOR_RECEIPT_INITIAL_BACKOFF = 1000;
