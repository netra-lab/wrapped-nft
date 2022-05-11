import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { deployments, ethers } from 'hardhat'
import { MockNFT, MockNFT__factory, WrappedNetraNFT } from '../types/typechain'

let snapshotId: string = '0x1'
export async function takeSnapshot() {
  snapshotId = await ethers.provider.send('evm_snapshot', [])
}

export async function revertToSnapshot() {
  await ethers.provider.send('evm_revert', [snapshotId])
}

export let accounts: SignerWithAddress[]
export let deployer: SignerWithAddress
export let controller: SignerWithAddress
export let other: SignerWithAddress

export let originalNft: MockNFT
export let otherNft: MockNFT
export let wrapperNft: WrappedNetraNFT

export function makeSuite(name: string, tests: () => void) {
  describe(name, () => {
    beforeEach(async () => {
      await takeSnapshot()
    })
    tests()
    afterEach(async () => {
      await revertToSnapshot()
    })
  })
}

before(async () => {
  ;({ deployer, controller } = await ethers.getNamedSigners())
  other = (await ethers.getSigners()).at(-1)!

  await deployments.fixture()
  wrapperNft = <WrappedNetraNFT>(
    await ethers.getContract('WrappedNetraRecordNFT', deployer)
  )
  originalNft = await new MockNFT__factory().connect(deployer).deploy()
  await originalNft.mint(100)

  otherNft = await new MockNFT__factory().connect(deployer).deploy()
  await otherNft.mint(100)
})
