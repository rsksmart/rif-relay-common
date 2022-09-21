// import {
//   IRelayHub,
//   RelayManagerData,
//   DeployRequest,
//   RelayRequest,
// } from '@rsksmart/rif-relay-contracts';
// import { Contract } from 'ethers';
// import {
//   DeployTransactionRequest,
//   RelayTransactionRequest,
// } from '../types/RelayTransactionRequest';

// // export function event2topic(contract: Contract, names: string[]): any {
// //   // for testing: don't crash on mockup..
// //   // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
// //   if (!contract.options || !contract.options.jsonInterface) {
// //     return names;
// //   }
// //   if (typeof names === 'string') {
// //     return event2topic(contract, [names])[0];
// //   }

// //   return (
// //     contract.options.jsonInterface
// //       .filter((e: any) => names.includes(e.name))
// //       //
// //       .map(abi.encodeEventSignature)
// //   );
// // }

// export function addresses2topics(addresses: string[]): string[] {
//   return addresses.map(address2topic);
// }

// export function address2topic(address: string): string {
//   return '0x' + '0'.repeat(24) + address.toLowerCase().slice(2);
// }

// // -juraj not sure if still necessary
// // extract revert reason from a revert bytes array.
// // export function decodeRevertReason(
// //   revertBytes: string,
// //   throwOnError = false
// // ): string | null {
// //   if (revertBytes == null) {
// //     return null;
// //   }
// //   if (!revertBytes.startsWith('0x08c379a0')) {
// //     if (throwOnError) {
// //       throw new Error('invalid revert bytes: ' + revertBytes);
// //     }

// //     return revertBytes;
// //   }

// //   //
// //   return abi.decodeParameter('string', '0x' + revertBytes.slice(10)) as any;
// // }

// export function getLocalEip712Signature(
//   typedRequestData: EIP712TypedData,
//   privateKey: Buffer
// ): string {
//   //
//   return sigUtil.signTypedData_v4(privateKey, { data: typedRequestData });
// }

// export async function getEip712Signature(
//   web3: Web3,
//   typedRequestData: EIP712TypedData,
//   methodSuffix = '',
//   jsonStringifyRequest = false
// ): Promise<string> {
//   const senderAddress = typedRequestData.message.from;
//   let dataToSign: EIP712TypedData | string;
//   if (jsonStringifyRequest) {
//     dataToSign = JSON.stringify(typedRequestData);
//   } else {
//     dataToSign = typedRequestData;
//   }

//   return await new Promise((resolve, reject) => {
//     let method;
//     //  (the entire web3 typing is fucked up)
//     if (typeof web3.currentProvider.sendAsync === 'function') {
//       //
//       method = web3.currentProvider.sendAsync;
//     } else {
//       //
//       method = web3.currentProvider.send;
//     }
//     method.bind(web3.currentProvider)(
//       {
//         method: 'eth_signTypedData' + methodSuffix,
//         params: [senderAddress, dataToSign],
//         from: senderAddress,
//         id: Date.now(),
//       },
//       (error: Error | string | null, result?: string) => {
//         if (result?.error != null) {
//           error = result.error;
//         }
//         if (error != null || result == null) {
//           reject((error as any).message ?? error);
//         } else {
//           resolve(result.result);
//         }
//       }
//     );
//   });
// }

// /**
//  * @returns maximum possible gas consumption by this deploy call
//  */
// export function calculateDeployTransactionMaxPossibleGas(
//   estimatedDeployGas: string,
//   estimatedTokenPaymentGas?: string
// ): BN {
//   if (
//     estimatedTokenPaymentGas === undefined ||
//     estimatedTokenPaymentGas == null ||
//     toBN(estimatedTokenPaymentGas).isZero()
//   ) {
//     // Subsidized case
//     return toBN(estimatedDeployGas).add(toBN('12000'));
//   } else {
//     return toBN(estimatedDeployGas);
//   }
// }

// /**
//  * @returns maximum possible gas consumption by this relay call
//  * Note that not using the linear fit would result in an Inadequate amount of gas
//  * You can add another kind of estimation (a hardcoded value for example) in that "else" statement
//  * if you don't then use this function with usingLinearFit = true
//  */
// export function estimateMaxPossibleRelayCallWithLinearFit(
//   relayCallGasLimit: number,
//   tokenPaymentGas: number,
//   addCushion = false
// ): number {
//   const cushion = addCushion ? constants.ESTIMATED_GAS_CORRECTION_FACTOR : 1.0;

//   if (toBN(tokenPaymentGas).isZero()) {
//     // Subsidized case
//     // y = a0 + a1 * x = 85090.977 + 1.067 * x
//     const a0 = Number('85090.977');
//     const a1 = Number('1.067');
//     const estimatedCost = a1 * relayCallGasLimit + a0;
//     const costWithCushion = Math.ceil(estimatedCost * cushion);

//     return costWithCushion;
//   } else {
//     // y = a0 + a1 * x = 72530.9611 + 1.1114 * x
//     const a0 = Number('72530.9611');
//     const a1 = Number('1.1114');
//     const estimatedCost = a1 * (relayCallGasLimit + tokenPaymentGas) + a0;
//     const costWithCushion = Math.ceil(estimatedCost * cushion);

//     return costWithCushion;
//   }
// }

// export function parseHexString(str: string): number[] {
//   const result = [];
//   while (str.length >= 2) {
//     result.push(parseInt(str.substring(0, 2), 16));

//     str = str.substring(2, str.length);
//   }

//   return result;
// }

// export function isSameAddress(address1: string, address2: string): boolean {
//   return address1.toLowerCase() === address2.toLowerCase();
// }

// export async function sleep(ms: number): Promise<void> {
//   return await new Promise((resolve) => setTimeout(resolve, ms));
// }

// export function randomInRange(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min) + min);
// }

// export function isSecondEventLater(a: EventData, b: EventData): boolean {
//   if (a.blockNumber === b.blockNumber) {
//     return b.transactionIndex > a.transactionIndex;
//   }

//   return b.blockNumber > a.blockNumber;
// }

// export function getLatestEventData(events: EventData[]): EventData | undefined {
//   if (events.length === 0) {
//     return;
//   }
//   const eventDataSorted = events.sort((a: EventData, b: EventData) => {
//     if (a.blockNumber === b.blockNumber) {
//       return b.transactionIndex - a.transactionIndex;
//     }

//     return b.blockNumber - a.blockNumber;
//   });

//   return eventDataSorted[0];
// }

// export function isRegistrationValid(
//   relayData: RelayManagerData | undefined,
//   config: any,
//   managerAddress: string
// ): boolean {
//   const portIncluded: boolean = config.url.indexOf(':') > 0;

//   return (
//     relayData !== undefined &&
//     isSameAddress(relayData.manager, managerAddress) &&
//     relayData.url.toString() ===
//       config.url.toString() +
//         (!portIncluded && config.port > 0 ? ':' + config.port.toString() : '')
//   );
// }

// export interface VerifierGasLimits {
//   preRelayedCallGasLimit: string;
//   postRelayedCallGasLimit: string;
// }

// export interface Signature {
//   v: number[];
//   r: number[];
//   s: number[];
// }

// function isDeployRequest(req: any): boolean {
//   let isDeploy = false;
//   if (req.relayRequest.request.recoverer !== undefined) {
//     isDeploy = true;
//   }

//   return isDeploy;
// }

// export function transactionParamDataCost(
//   req: RelayTransactionRequest | DeployTransactionRequest
// ): number {
//   //
//   const IRelayHubContract = TruffleContract({
//     contractName: 'IRelayHub',
//     abi: IRelayHub.abi,
//   });
//   IRelayHubContract.setProvider(web3.currentProvider, undefined);

//   const relayHub = new IRelayHubContract('');

//   const isDeploy = isDeployRequest(req);
//   const method = isDeploy
//     ? relayHub.contract.methods.deployCall(
//         req.relayRequest as DeployRequest,
//         req.metadata.signature
//       )
//     : relayHub.contract.methods.relayCall(
//         req.relayRequest as RelayRequest,
//         req.metadata.signature
//       );

//   const encodedCall = method.encodeABI() ?? '0x';

//   const dataAsByteArray: Uint8Array = arrayify(encodedCall);
//   const nonZeroes = nonZeroDataBytes(dataAsByteArray);

//   const zeroVals = dataAsByteArray.length - nonZeroes;

//   return (
//     constants.TRANSACTION_GAS_COST +
//     zeroVals * constants.TX_ZERO_DATA_GAS_COST +
//     nonZeroes * constants.TX_NO_ZERO_DATA_GAS_COST
//   );
// }

// function nonZeroDataBytes(data: Uint8Array): number {
//   let counter = 0;

//   for (let i = 0; i < data.length; i++) {
//     const byte = data[i];
//     if (byte !== 0) {
//       ++counter;
//     }
//   }

//   return counter;
// }
