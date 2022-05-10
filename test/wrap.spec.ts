import { expect } from 'chai'
import {
  controller,
  deployer,
  makeSuite,
  originalNft,
  otherNft,
  wrapperNft,
} from './__setup.spec'

makeSuite('Wrap', () => {
  beforeEach(async () => {
    expect(
      await wrapperNft
        .connect(controller)
        .whitelistCollection(originalNft.address)
    ).to.be.ok
  })

  describe('Wraps whitelisted token', () => {
    let originalSupply: number
    const wrappedTokenId = 1
    let expectedTokenId: number

    beforeEach(async () => {
      originalSupply = (await wrapperNft.totalSupply()).toNumber()
      expectedTokenId = originalSupply + 1

      await originalNft.approve(wrapperNft.address, wrappedTokenId)
      expect(await wrapperNft.wrap(originalNft.address, wrappedTokenId)).to.be
        .ok
    })

    it('Locks original NFT', async () => {
      expect(await originalNft.ownerOf(wrappedTokenId)).to.eq(
        wrapperNft.address
      )
    })

    it('Receives wrapped token', async () => {
      expect(await wrapperNft.ownerOf(expectedTokenId)).to.eq(deployer.address)
    })

    it('Increments token ID', async () => {
      expect(await wrapperNft.totalSupply()).to.eq(expectedTokenId)
    })

    it('Fills wrap info', async () => {
      const wrapInfo = await wrapperNft.getWrapInfo(expectedTokenId)

      expect(wrapInfo.collection).to.eq(originalNft.address)
      expect(wrapInfo.tokenId).to.eq(wrappedTokenId)
    })

    it('Returns the same URI', async () => {
      expect(await originalNft.tokenURI(wrappedTokenId)).to.eq(
        await wrapperNft.tokenURI(expectedTokenId)
      )
    })
  })

  context('On random token', () => {
    it('Reverts', async () => {
      await otherNft.approve(wrapperNft.address, 1)
      await expect(wrapperNft.wrap(otherNft.address, 1)).to.be.revertedWith(
        `NotWhitelisted("${otherNft.address}")`
      )
    })
  })
})
