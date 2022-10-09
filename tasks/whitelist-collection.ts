import { task } from 'hardhat/config'
import { WrappedNetraNFT } from '../types/typechain'

task('whitelistCollection', 'Whitelists collection')
  .addParam('contract', 'NFT contract address')
  .setAction(async (args, hre) => {
    const { ethers } = hre

    const nftAddress = args.contract
    const [signer] = await ethers.getSigners()
    const wrapper: WrappedNetraNFT = await ethers.getContract(
      'WrappedNetraRecordNFT',
      signer
    )

    {
      console.log('Whitelisting...')
      const { hash, wait } = await wrapper.whitelistCollection(nftAddress)
      console.log('Sent:', hash)
      const { blockNumber } = await wait()
      console.log('Confirmed:', blockNumber)
    }
  })
