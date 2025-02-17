const { ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const { getNetworkConfig } = require("../helper-hardhat-config")

const conf = getNetworkConfig()

const RATE_MODE = 2
const BORROW_RATE = 0.8

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
    availableBorrowsETH = Number(availableBorrowsETH)
    totalDebtETH = Number(totalDebtETH)
    console.log(`You have ${totalDebtETH / 1e18} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH / 1e18} worth of ETH.`)

    console.log("starting to get DAI/ETH price...")
    const daiEthPrice = await getDAIETHPrice()

    const amountDaiToBorrow = availableBorrowsETH * BORROW_RATE * (1 / Number(daiEthPrice))
    console.log(`you can borrow ${amountDaiToBorrow} DAI...`)

    const borrowEth = ethers.parseEther(amountDaiToBorrow.toString())

    await borrowDai(lendingPool, borrowEth, deployer)

    await approveErc20(conf.daiToken, lendingPool.target, borrowEth, signer)
    await repayDai(lendingPool, borrowEth, deployer)
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
    console.log(`You have ${Number(totalCollateralETH) / 1e18} worth of ETH deposited.`)
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

async function borrowDai(lendingPool, amount, account) {
    const tx = await lendingPool.borrow(conf.daiToken, amount, RATE_MODE, 0, account)
    tx.wait(1)
    console.log("Borrowed!")
    const { totalDebtETH } = await getBorrowerData(lendingPool, account)
    console.log(`Now you have already borrowed ${Number(totalDebtETH) / 1e18} worth of ETH to exchange DAI.`)
}

async function repayDai(lendingPool, amount, account) {
    const tx = await lendingPool.repay(conf.daiToken, amount, RATE_MODE, account)
    tx.wait(1)
    console.log("Repaid!")
    const { availableBorrowsETH } = await getBorrowerData(lendingPool, account)
    console.log(`You can borrow ${Number(availableBorrowsETH) / 1e18} worth of ETH.`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
