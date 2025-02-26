const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeMetadataJson } = require("../utils/pinata")

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("100")
let tokenUrls = [
    "bafkreiaclwpdgzfirul4w2piw6ru7rlnzz4upsh25pvcxpo75tqlnzurra",
    "bafkreif635u25fe24xssjslmavzgtqzbyrxppvygltocpmwylls3j5jlnq",
    "bafkreidzg3rbrlcvn4u5mbya4iij7soy3oblloa7yugco2tfqzsp62amuq",
]

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

        log("mocks Deployed...")
    } else {
        vrfCoordinatorAddress = helperConf["vrfCoordinator"]
        subId = helperConf["subscriptionId"]
    }

    if (tokenUrls.length < 1) {
        tokenUrls = await handleTokenUrls()
    }

    const args = [
        vrfCoordinatorAddress,
        subId,
        helperConf["gasLane"],
        helperConf["callbackGasLimit"],
        tokenUrls,
        helperConf["mintFee"],
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    const address = randomIpfsNft.address
    console.log(`randomNft contract address: ${address}`)

    // Add the contract as a consumer of the VRFCoordinator if network is development.
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorMock.addConsumer(subId, address)
        const isAdded = await vrfCoordinatorMock.consumerIsAdded(subId, address)
        log(`Is randomIpfsNft add in VRFCoordinator Consumer: ${isAdded}`)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Raffle is verifying...")
        await verify(address, args)
    }

    log("randomIpfsNft contract deployed!")
    log("----------------------------------------------------------")
}

const imagesLocation = "./images/randomNft/"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            creator: "Allen",
            date: new Date().toISOString(),
        },
    ],
}

async function handleTokenUrls() {
    const uploadedTokens = []
    const { responses, files } = await storeImages(imagesLocation)
    for (const index in responses) {
        let tokenMetadata = { ...metadataTemplate }
        tokenMetadata.name = files[index].replace(/\b.png|\b.jpg|\b.jpeg/, "")
        tokenMetadata.description = `An adorable ${tokenMetadata.name} pup!`
        tokenMetadata.image = `https://ipfs.io/ipfs/${responses[index].IpfsHash}`

        console.log(`Uploading ${tokenMetadata.name}...`)
        const uploadedMetadata = await storeMetadataJson(tokenMetadata)
        uploadedTokens.push(`${uploadedMetadata.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are: \n", uploadedTokens)
    return uploadedTokens
}

module.exports.tags = ["all", "random-nft"]
