import { task } from 'hardhat/config'
import { ERC721, ERC721__factory, WrappedNetraNFT } from '../types/typechain'

task('batchWrap', 'Wraps multiple tokens')
  .addParam('contract', 'NFT contract address')
  .addParam('tokenids', 'Token IDs to be wrapped, in `<id-1>,<id-2>` format')
  .setAction(async (args, hre) => {
    const { ethers } = hre

    const nftAddress = args.contract
    const tokenIds = args.tokenids.split(',')

    const [signer] = await ethers.getSigners()
    const nft: ERC721 = ERC721__factory.connect(nftAddress, signer)
    const wrapper: WrappedNetraNFT = await ethers.getContract(
      'WrappedNetraRecordNFT'
    )

    if (!(await nft.isApprovedForAll(signer.address, wrapper.address))) {
      console.log('Approving operator...')

      const { hash, wait } = await nft.setApprovalForAll(wrapper.address, true)
      console.log('Sent:', hash)
      const { blockNumber } = await wait()
      console.log('Confirmed:', blockNumber)
    }

    {
      console.log('Wrapping...')
      const { hash, wait } = await wrapper.batchWrap(nft.address, tokenIds)
      console.log('Sent:', hash)
      const { blockNumber } = await wait()
      console.log('Confirmed:', blockNumber)
    }
  })
