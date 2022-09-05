import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [],
  },
  networks: {
    regtest: {
      url: 'http://localhost:4444',
    },
  },
};

export default config;
