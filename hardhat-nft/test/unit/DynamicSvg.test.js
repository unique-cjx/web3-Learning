const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const fs = require("fs")
const { Buffer } = require("buffer")

if (!developmentChains.includes(network.name)) {
    describe.skip
    return
}

function svgToImageURI(svg) {
    // Base64 encode the SVG string
    const baseURL = "data:image/svg+xml;base64,"
    return baseURL + Buffer.from(svg).toString("base64")
}

function svgToTokenURL(imgUrl) {
    const baseURL = "data:application/json;base64,"
    const svgBase64Encoded =
        '{"name":"Dynamic SVG NFT", "description":"An NFT that changes based on the Chainlink Feed", ' +
        '"attributes":[{"trait_type":"coolness", "value":100}], "image":"' +
        imgUrl +
        '"}'

    return baseURL + Buffer.from(svgBase64Encoded).toString("base64")
}

describe("Dynamic SVG Tests", function () {
    let dynamicSvgNft, mockV3Aggregator, lowSVGUrl, highSVGUrl, lowSVGTokenUrl, highSVGTokenUrl
    beforeEach(async function () {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "dynamic-nft"])
        const dynamicSvgNftContract = await ethers.getContract("DynamicSvgNft")
        dynamicSvgNft = dynamicSvgNftContract.connect(deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")

        lowSVGUrl = svgToImageURI(fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" }))
        highSVGUrl = svgToImageURI(fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" }))

        lowSVGTokenUrl = svgToTokenURL(lowSVGUrl)
        highSVGTokenUrl = svgToTokenURL(highSVGUrl)
    })

    describe("Constructor", () => {
        it("sets starting values correctly", async function () {
            const lowSVG = await dynamicSvgNft.getLowSVG()
            const highSVG = await dynamicSvgNft.getHighSVG()
            const priceFeed = await dynamicSvgNft.getPriceFeed()
            assert.equal(lowSVGUrl, lowSVG)
            assert.equal(highSVGUrl, highSVG)
            assert.equal(priceFeed, mockV3Aggregator.target)
        })
    })

    describe("MintNft", () => {
        it("emits an event and creates the NFT", async function () {
            const highValue = ethers.parseEther("10")
            await expect(dynamicSvgNft.mintNft(highValue)).to.emit(dynamicSvgNft, "CreatedNFT").withArgs(0, highValue)
            const tokenCounter = await dynamicSvgNft.getTokenCounter()
            assert.equal(tokenCounter.toString(), "1")
            const tokenURI = await dynamicSvgNft.tokenURI(0)
            assert.equal(tokenURI, highSVGTokenUrl)
        })
        it("lower than high minted price", async function () {
            const tokenCounter = await dynamicSvgNft.getTokenCounter()
            const highValue = ethers.parseEther("1")
            const txResponse = await dynamicSvgNft.mintNft(highValue)
            await txResponse.wait(1)
            const tokenURI = await dynamicSvgNft.tokenURI(tokenCounter)
            assert.equal(tokenURI, lowSVGTokenUrl)
        })
    })
})
