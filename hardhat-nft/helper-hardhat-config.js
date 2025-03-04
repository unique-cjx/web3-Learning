const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "localhost",
        mintFee: ethers.parseEther("0.5"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "1000000",
        linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        mintFee: ethers.parseEther("0.01"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "1000000",
        vrfCoordinator: "",
        subscriptionId: "",
        ethFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]

const meTokenUrl = "https://ipfs.io/ipfs/bafkreiahf3snlz3mwdc7chsootsj2qeu644ad3eezydacqguk5yrhgh6jy"
const randomTokenUrls = [
    "https://ipfs.io/ipfs/bafkreiaafa67hlm5dgdoot7ffxsteywzxdcvqghj3732hqkf7pclcly2ce",
    "https://ipfs.io/ipfs/bafkreie3lnin2tmfkna4lvkpndoornz7ut33u3uiqxc4xjvrux3uocmrfm",
    "https://ipfs.io/ipfs/bafkreib36x37qscz2y6hpq3vconcy7mxiuffrwv332oda5c3ucm7c2fpd4",
]

module.exports = {
    networkConfig,
    developmentChains,
    meTokenUrl,
    randomTokenUrls,
}
