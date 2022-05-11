import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deployer, controller } = await getNamedAccounts()

  await deployments.deploy('WrappedNetraRecordNFT', {
    from: deployer,
    args: ['Wrapped Netra Record', 'wRECORD', controller],
    contract: 'WrappedNetraNFT',
  })
}
export default func
