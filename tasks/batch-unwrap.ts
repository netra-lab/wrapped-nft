import { task } from 'hardhat/config'
import { WrappedNetraNFT } from '../types/typechain'

task('batchUnwrap', 'Unwraps multiple tokens')
  .addParam('tokenids', 'Token IDs to be unwrapped, in `<id-1>,<id-2>` format')
  .setAction(async (args, hre) => {
    const { ethers } = hre

    const tokenIds = args.tokenids.split(',')
    const wrapper: WrappedNetraNFT = await ethers.getContract(
      'WrappedNetraRecordNFT'
    )

    {
      console.log('Unwrapping...')
      const { hash, wait } = await wrapper.batchUnwrap(tokenIds)
      console.log('Sent:', hash)
      const { blockNumber } = await wait()
      console.log('Confirmed:', blockNumber)
    }
  })
