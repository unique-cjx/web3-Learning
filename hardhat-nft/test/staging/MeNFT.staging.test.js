const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, testTokenURL } = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) {
    describe.skip
    return
}

describe("MeNFT Unit Tests", function () {
    let nft, deployer

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["menft"])
        nft = await ethers.getContract("MeNFT")
    })

    describe("Constructor", () => {
        it("Initializes the NFT Correctly.", async () => {
            const name = await nft.name()
            const symbol = await nft.symbol()
            const tokenCounter = await nft.getTokenCounter()
            assert.equal(name, "Allen")
            assert.equal(symbol, "ME")
            assert.equal(tokenCounter.toString(), "0")
        })
    })

    describe("Me NFT", () => {
        beforeEach(async () => {
            const txResponse = await nft.mintNft()
            await txResponse.wait(1)
        })
        it("Allows users to mint an NFT, and updates appropriately", async function () {
            const tokenURI = await nft.tokenURI(0)
            let tokenCounter = await nft.getTokenCounter()
            console.log("me-nft url: ", tokenURI)

            assert.equal(tokenCounter.toString(), "1")
            assert.equal(tokenURI, testTokenURL)
        })

        it("Show the correct balance and owner of an NFT", async function () {
            const deployerAddress = deployer.address

            const txResponse = await nft.mintNft()
            await txResponse.wait(1)

            const deployerBalance = await nft.balanceOf(deployerAddress)
            const owner = await nft.ownerOf("0")

            assert.equal(deployerBalance.toString(), "2")
            assert.equal(owner, deployerAddress)
        })
    })
})
