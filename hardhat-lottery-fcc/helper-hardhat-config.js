const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "localhost",
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "100000",
        autoUpdateInterval: "30",
        linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        vrfCoordinator: "",
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        subscriptionId: "",
        callbackGasLimit: "500000",
        autoUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
