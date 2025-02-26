const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

const BASE_FEE = ethers.parseEther("0.01")
const GAS_PRICE_LINK = 1e9
const WEI_PER_UNIT_LINK = 7407618736330013

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK],
        })

        log("VRFCoordinatorV2_5Mock Mocks Deployed!")
        log("----------------------------------------------------------")
        log("You are deploying to a local network, you'll need a local network running to interact")
        log("Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!")
        log("----------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
