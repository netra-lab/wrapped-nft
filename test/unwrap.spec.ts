import { expect } from 'chai'
import { constants } from 'ethers'
import { range } from 'lodash'
import {
  controller,
  deployer,
  makeSuite,
  originalNft,
  other,
  wrapperNft,
} from './__setup.spec'

makeSuite('Unwrap', () => {
  describe('Batched', () => {
    const tokenIds = range(1, 3)
    let originalSupply: number

    beforeEach(async () => {
      originalSupply = (await wrapperNft.totalSupply()).toNumber()

      const whitelist = wrapperNft
        .connect(controller)
        .whitelistCollection(originalNft.address)
      expect(await whitelist).to.be.ok

      for await (const tokenId of tokenIds) {
        await originalNft.approve(wrapperNft.address, tokenId)
      }
      await wrapperNft.batchWrap(originalNft.address, tokenIds)
    })

    context('When not owner', () => {
      it('Reverts', async () => {
        await expect(
          wrapperNft.connect(other).batchUnwrap(tokenIds)
        ).to.be.revertedWith(`NotOwner("${other.address}", ${tokenIds[0]})`)
      })
    })

    context('When owner', () => {
      beforeEach(async () => {
        expect(await wrapperNft.batchUnwrap(tokenIds)).to.be.ok
      })

      it('Returns original token', async () => {
        for await (const tokenId of tokenIds) {
          expect(await originalNft.ownerOf(tokenId)).to.eq(deployer.address)
        }
      })

      it('Burns token', async () => {
        expect(await wrapperNft.totalSupply()).to.eq(originalSupply)

        for await (const tokenId of tokenIds) {
          await expect(wrapperNft.ownerOf(tokenId)).to.be.revertedWith(
            'ERC721: owner query for nonexistent token'
          )

          const wrapInfo = await wrapperNft.getWrapInfo(tokenId)
          expect(wrapInfo.collection).to.eq(constants.AddressZero)
          expect(wrapInfo.tokenId).to.eq(0)
        }
      })
    })
  })

  describe('Single', () => {
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
        expect(await originalNft.ownerOf(originalTokenId)).to.eq(
          deployer.address
        )
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
})
