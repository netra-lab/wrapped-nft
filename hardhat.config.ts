import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'dotenv/config'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import type { HardhatUserConfig } from 'hardhat/config'
import getAlchemyNetworks from './helpers/get-alchemy-networks'
import './tasks'

export default <HardhatUserConfig>{
  solidity: {
    version: '0.8.13',
    settings: { optimizer: { enabled: true, runs: 10000 } },
  },
  networks: {
    ...getAlchemyNetworks({
      networks: [
        { chainId: 4, name: 'rinkeby' },
        { chainId: 137, name: 'matic' },
      ],
    }),
    truffle: {
      url: 'http://localhost:24012/rpc',
      timeout: 99999999,
    },
  },
  typechain: { outDir: 'types/typechain' },
  namedAccounts: {
    deployer: {
      default: 0,
      4: '0xA122D06b3C3f9Ccdd78438f8253C2E2Cf98d63B4',
      137: '0x8331be29A3aCb518350E692BA7a8AA5E4416aAFC',
    },
    controller: {
      default: 1,
      rinkeby: '0xA122D06b3C3f9Ccdd78438f8253C2E2Cf98d63B4',
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
