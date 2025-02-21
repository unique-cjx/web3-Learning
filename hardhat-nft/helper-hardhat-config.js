const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]

const testTokenURL = "https://ipfs.io/ipfs/bafkreiahf3snlz3mwdc7chsootsj2qeu644ad3eezydacqguk5yrhgh6jy"

module.exports = {
    networkConfig,
    developmentChains,
    testTokenURL,
}
