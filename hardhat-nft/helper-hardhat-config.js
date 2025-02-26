const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "localhost",
        mintFee: ethers.parseEther("0.5"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "100000",
        autoUpdateInterval: "30",
        linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        mintFee: ethers.parseEther("0.01"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        vrfCoordinator: "",
        subscriptionId: "",
    },
}

const developmentChains = ["hardhat", "localhost"]

const testTokenURL = "https://ipfs.io/ipfs/bafkreiahf3snlz3mwdc7chsootsj2qeu644ad3eezydacqguk5yrhgh6jy"

module.exports = {
    networkConfig,
    developmentChains,
    testTokenURL,
}
