import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'dotenv/config'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import type { HardhatUserConfig } from 'hardhat/config'

export default <HardhatUserConfig>{
  solidity: {
    version: '0.8.13',
    settings: { optimizer: { enabled: true, runs: 10000 } },
  },
  typechain: { outDir: 'types/typechain' },
  namedAccounts: {
    deployer: {
      default: 0,
      137: '0x8331be29A3aCb518350E692BA7a8AA5E4416aAFC',
    },
    controller: {
      default: 1,
      137: '0x781265106778760098c25b91509fF05C4bA49784',
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: process.env.REPORT_GAS_CURRENCY ?? 'USD',
    token: process.env.REPORT_GAS_TOKEN ?? 'MATIC',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
}
