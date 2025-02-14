const { ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const { getNetworkConfig } = require("../helper-hardhat-config")

const conf = getNetworkConfig()

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)

    const lendingPool = await getLendingPool(signer)
    console.log("LendingPool address:", lendingPool.target)

    console.log("starting to approve WETH...")
    await approveErc20(conf.wETHAddress, lendingPool.target, conf.wETHAmount, signer)

    console.log("depositing WETH...")
    await lendingPool.deposit(conf.wETHAddress, conf.wETHAmount, deployer, 0)

    console.log("starting to get borrower data...")
    let { availableBorrowsETH, totalDebtETH } = await getBorrowerData(lendingPool, deployer)

    console.log("starting to get DAI/ETH price...")
    const price = await getDAIETHPrice()
}

async function getLendingPool(signer) {
    const provider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        conf.lendingPoolProviderAddress,
        signer,
    )
    const lendingPoolAddr = await provider.getLendingPool()
    return await ethers.getContractAt("ILendingPool", lendingPoolAddr, signer)
}

async function approveErc20(erc20Address, spenderAddress, amount, signer) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer)
    const tx = await erc20Token.approve(spenderAddress, amount)
    await tx.wait(1)
    console.log("Approved!")
}

async function getBorrowerData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${ethers.parseEther(totalCollateralETH)} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${ethers.parseEther(availableBorrowsETH)} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getDAIETHPrice() {
    const priceFeed = await ethers.getContractAt("AggregatorV3Interface", conf.daiEthPriceFeed)
    const priceData = await priceFeed.latestRoundData()
    const price = priceData.answer
    const decimals = await priceFeed.decimals()
    console.log(`DAI/ETH price: ${(Number(price) / 10 ** Number(decimals)).toFixed(8)}`)
    return price
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
