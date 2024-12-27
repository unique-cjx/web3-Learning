const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("100")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    console.log(`deployer = ${deployer}, chainId = ${chainId}`)

    let vrfCoordinatorAddress, subId, vrfCoordinatorMock
    const helperConf = networkConfig[chainId]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2_5Mock")
        vrfCoordinatorAddress = vrfCoordinatorMock.target
        const transactionResp = await vrfCoordinatorMock.createSubscription()
        const transactionReceipt = await transactionResp.wait(1)

        // funding a subscription with an arbitrary amount for testing.
        subId = transactionReceipt.logs[0].args.subId
        console.log("fun subscription subId:", subId)
        await vrfCoordinatorMock.fundSubscription(subId, VRF_SUB_FUND_AMOUNT)

        // console.log("get fund subscription balance:", vrfCoordinatorBalance.toString())
        log("mocks Deployed...")
    } else {
        vrfCoordinatorAddress = helperConf["vrfCoordinator"]
        subId = helperConf["subscriptionId"]
    }

    const args = [
        vrfCoordinatorAddress,
        helperConf["entranceFee"],
        helperConf["gasLane"],
        subId,
        helperConf["callbackGasLimit"],
        helperConf["autoUpdateInterval"],
    ]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Add the Raffle contract as a consumer of the VRFCoordinator.
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorMock.addConsumer(subId, raffle.address)
        const isAdded = await vrfCoordinatorMock.consumerIsAdded(subId, raffle.address)
        log(`Is RaffleContract add in VRFCoordinator Consumer: ${isAdded}`)
    }

    log(`Raffle contract address: ${raffle.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Raffle is verifying...")
        await verify(raffle.address, args)
    }
    
    log("Raffle contract deployed!")
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "raffle"]
