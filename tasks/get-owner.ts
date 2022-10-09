import { task } from 'hardhat/config'
import { WrappedNetraNFT } from '../types/typechain'

task('getOwner', 'Print contract owner').setAction(async (_, hre) => {
  const { ethers } = hre

  const wrapper: WrappedNetraNFT = await ethers.getContract(
    'WrappedNetraRecordNFT'
  )

  console.log(`Owner: ${await wrapper.owner()}`)
})
