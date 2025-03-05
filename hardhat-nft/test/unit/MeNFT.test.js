const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, meTokenUrl } = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) {
    describe.skip
    return
}

describe("MeNFT Unit Tests", function () {
    let meNft, deployer

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["me-nft"])
        meNft = await ethers.getContract("MeNFT")
    })

    describe("Constructor", () => {
        it("Initializes the NFT Correctly.", async () => {
            const name = await meNft.name()
            const symbol = await meNft.symbol()
            const tokenCounter = await meNft.getTokenCounter()
            assert.equal(name, "Allen")
            assert.equal(symbol, "ME")
            assert.equal(tokenCounter.toString(), "0")
        })
    })

    describe("Me NFT", () => {
        beforeEach(async () => {
            const txResponse = await meNft.mintNft()
            await txResponse.wait(1)
        })
        it("Allows users to mint an NFT, and updates appropriately", async function () {
            const tokenURI = await meNft.tokenURI(0)
            let tokenCounter = await meNft.getTokenCounter()
            console.log("me-meNft url: ", tokenURI)

            assert.equal(tokenCounter.toString(), "1")
            assert.equal(tokenURI, meTokenUrl)
        })

        it("Show the correct balance and owner of an NFT", async function () {
            const deployerAddress = deployer.address

            const txResponse = await meNft.mintNft()
            await txResponse.wait(1)

            const deployerBalance = await meNft.balanceOf(deployerAddress)
            const owner = await meNft.ownerOf("0")

            assert.equal(deployerBalance.toString(), "2")
            assert.equal(owner, deployerAddress)
        })
    })
})
