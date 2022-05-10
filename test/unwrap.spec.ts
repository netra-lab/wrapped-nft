import { expect } from 'chai'
import { constants } from 'ethers'
import {
  controller,
  deployer,
  makeSuite,
  originalNft,
  other,
  wrapperNft,
} from './__setup.spec'

makeSuite('Unwrap', () => {
  let originalSupply: number
  const originalTokenId = 1
  let wrappedTokenId: number

  beforeEach(async () => {
    const whitelist = wrapperNft
      .connect(controller)
      .whitelistCollection(originalNft.address)
    expect(await whitelist).to.be.ok

    await originalNft.approve(wrapperNft.address, originalTokenId)
    await wrapperNft.wrap(originalNft.address, originalTokenId)

    originalSupply = (await wrapperNft.totalSupply()).toNumber()
    wrappedTokenId = originalSupply
  })

  context('When not owner', () => {
    it('Reverts', async () => {
      await expect(
        wrapperNft.connect(other).unwrap(wrappedTokenId)
      ).to.be.revertedWith(`NotOwner("${other.address}", ${wrappedTokenId})`)
    })
  })

  context('When owner', () => {
    beforeEach(async () => {
      expect(await wrapperNft.unwrap(wrappedTokenId)).to.be.ok
    })

    it('Returns original token', async () => {
      expect(await originalNft.ownerOf(originalTokenId)).to.eq(deployer.address)
    })

    it('Burns token', async () => {
      expect(await wrapperNft.totalSupply()).to.eq(originalSupply - 1)

      await expect(wrapperNft.ownerOf(wrappedTokenId)).to.be.revertedWith(
        'ERC721: owner query for nonexistent token'
      )

      const wrapInfo = await wrapperNft.getWrapInfo(wrappedTokenId)
      expect(wrapInfo.collection).to.eq(constants.AddressZero)
      expect(wrapInfo.tokenId).to.eq(0)
    })
  })
})
