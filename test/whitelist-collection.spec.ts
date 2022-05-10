import { expect } from 'chai'
import {
  controller,
  makeSuite,
  originalNft,
  other,
  wrapperNft,
} from './__setup.spec'

makeSuite('Whitelist collection', () => {
  context('When owner', () => {
    it('Whitelist the collection', async () => {
      const whitelist = wrapperNft
        .connect(controller)
        .whitelistCollection(originalNft.address)
      const isWhitelisted = wrapperNft.isWhitelisted(originalNft.address)

      expect(await whitelist).to.be.ok
      expect(await isWhitelisted).to.be.true
    })
  })

  context('When not owner', () => {
    it('Reverts', async () => {
      const whitelist = wrapperNft
        .connect(other)
        .whitelistCollection(originalNft.address)

      await expect(whitelist).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
