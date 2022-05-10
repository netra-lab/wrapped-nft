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
    context('On single wrap', async () => {
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
        expect(await wrapperNft.ownerOf(expectedTokenId)).to.eq(
          deployer.address
        )
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

    context('On multiple wrap', async () => {
      const tokenIds = [1, 2]

      beforeEach(async () => {
        for await (const tokenId of tokenIds) {
          await originalNft.approve(wrapperNft.address, tokenId)
          await originalNft.approve(wrapperNft.address, tokenId)
        }

        expect(
          await wrapperNft.batchWrap(
            [originalNft.address, originalNft.address],
            tokenIds
          )
        ).to.be.ok
      })

      it('Locks original NFT', async () => {
        for await (const tokenId of tokenIds) {
          expect(await originalNft.ownerOf(tokenId)).to.eq(wrapperNft.address)
        }
      })

      it('Receives wrapped token', async () => {
        for await (const tokenId of tokenIds) {
          expect(await wrapperNft.ownerOf(tokenId)).to.eq(deployer.address)
        }
      })

      it('Increments token ID', async () => {
        expect(await wrapperNft.totalSupply()).to.eq(tokenIds.at(-1)!)
      })

      it('Fills wrap info', async () => {
        for await (const tokenId of tokenIds) {
          const wrapInfo = await wrapperNft.getWrapInfo(tokenId)

          expect(wrapInfo.collection).to.eq(originalNft.address)
          expect(wrapInfo.tokenId).to.eq(tokenId)
        }
      })

      it('Returns the same URI', async () => {
        for await (const tokenId of tokenIds) {
          expect(await originalNft.tokenURI(tokenId)).to.eq(
            await wrapperNft.tokenURI(tokenId)
          )
        }
      })
    })
  })

  context('On random token', () => {
    it('Reverts wrap', async () => {
      await otherNft.approve(wrapperNft.address, 1)
      await expect(wrapperNft.wrap(otherNft.address, 1)).to.be.revertedWith(
        `NotWhitelisted("${otherNft.address}")`
      )
    })

    it('Reverts batch wrap', async () => {
      await otherNft.approve(wrapperNft.address, 1)
      await expect(
        wrapperNft.batchWrap([otherNft.address], [1])
      ).to.be.revertedWith(`NotWhitelisted("${otherNft.address}")`)
    })
  })
})
