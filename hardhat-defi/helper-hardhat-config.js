const networkConfig = {
    31337: {
        name: "localhost",
        wETHAmount: ethers.parseEther("100"),
        wETHAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolProviderAddress: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    // Due to the changing testnets, this testnet might not work as shown in the video
    11155111: {
        name: "sepolia",
        wETHAmount: ethers.parseEther("0.01"),
        wETHAddress: "0xdd13E55209Fd76AfE204dBda4007C227904f0a81",
        ethUSDPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        lendingPoolProviderAddress: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
        daiEthPriceFeed: "0xb4c4a493AB6356497713A78FFA6c60FB53517c63",
        daiToken: "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6",
    },
}

function getNetworkConfig() {
    const { network } = require("hardhat")
    return networkConfig[network.config.chainId]
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    getNetworkConfig,
    developmentChains,
}
