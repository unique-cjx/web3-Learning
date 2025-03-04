const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const helperConf = networkConfig[chainId]
    let EthAggregatorAddr

    log("Deploying DynamicNFT contract...")
    if (developmentChains.includes(network.name)) {
        const EthAggregator = await ethers.getContract("MockV3Aggregator")
        EthAggregatorAddr = EthAggregator.target
        log(`Local network the MockV3Aggregator address: ${EthAggregatorAddr}`)
    } else {
        EthAggregatorAddr = helperConf["ethFeedAddress"]
    }
    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

    const args = [EthAggregatorAddr, lowSVG, highSVG]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("DynamicSvgNft is being verified...")
        await verify(dynamicSvgNft.address, args)
    }

    log("DynamicSvgNft contract deployed!")
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "dynamic-nft"]
