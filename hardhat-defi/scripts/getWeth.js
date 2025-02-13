const { getNamedAccounts, ethers, network } = require("hardhat")
const { getNetworkConfig, wETHAmount } = require("../helper-hardhat-config")

async function getWeth() {
    const conf = getNetworkConfig[network.config.chainId]
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)
    const WETH = await ethers.getContractAt("IWeth", conf.wETHAddress, signer)
    console.log("WETH address:", WETH.target)

    const tx = await WETH.deposit({ value: wETHAmount })
    await tx.wait(1)

    const eth = await ethers.provider.getBalance(deployer)
    console.log("got WETH amount:", ethers.formatEther(eth))
}

module.exports = { getWeth }
