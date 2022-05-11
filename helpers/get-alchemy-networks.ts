import { AlchemyProvider, getNetwork } from '@ethersproject/providers'
import { HardhatUserConfig } from 'hardhat/types'

type Args = {
  networks: {
    name: string
    chainId: number
  }[]
}

export default function getAlchemyNetworks({ networks }: Args) {
  const apiKey = process.env.ALCHEMY_API_KEY
  if (!apiKey) return

  const privateKey = process.env.PRIVATE_KEY

  let config: HardhatUserConfig['networks'] = {}
  for (const { chainId, name } of networks) {
    const url = AlchemyProvider.getUrl(getNetwork(chainId), apiKey).url
    config = {
      ...config,
      [name]: {
        url,
        accounts: privateKey ? [privateKey] : [],
      },
    }
  }

  return config
}
