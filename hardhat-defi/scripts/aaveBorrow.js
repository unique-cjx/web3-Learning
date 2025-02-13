const { ethers, network } = require("hardhat")
const { getWeth } = require("./getWeth")
const { getNetworkConfig } = require("../helper-hardhat-config")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    console.log("LendingPool address:", lendingPool.target)
}

async function getLendingPool(account) {
    const conf = getNetworkConfig[network.config.chainId]
    const signer = await ethers.getSigner(account)
    const provider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        conf.lendingPoolProviderAddress,
        signer,
    )
    const lendingPoolAddr = await provider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddr, signer)
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
