const { getNamedAccounts, ethers } = require("hardhat")
const { getNetworkConfig } = require("../helper-hardhat-config")

const conf = getNetworkConfig()

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)
    const IWeth = await ethers.getContractAt("IWeth", conf.wETHAddress, signer)
    console.log("WETH address:", IWeth.target)

    const tx = await IWeth.deposit({ value: conf.wETHAmount })
    await tx.wait(1)

    const eth = await IWeth.balanceOf(deployer)
    console.log(`got ${ethers.formatEther(eth)} amount of WETH`)
}

module.exports = { getWeth }
