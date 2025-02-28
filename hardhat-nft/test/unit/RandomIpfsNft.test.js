const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig, randomTokenUrls } = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) {
    describe.skip
    return
}

describe("Random IPFS NFT Tests", function () {
    let randomIpfsNftContract, randomIpfsNft, vrfCoordinatorV2_5Mock, deployer, mintFee
    const chainId = network.config.chainId

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "random-nft"])
        randomIpfsNftContract = await ethers.getContract("RandomIpfsNft")
        randomIpfsNft = randomIpfsNftContract.connect(deployer)
        vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")

        mintFee = await randomIpfsNft.getMintFee()
    })

    describe("Constructor", function () {
        it("sets starting values correctly", async function () {
            const tokenUrl = await randomIpfsNft.getDogTokenUrl(0)
            console.log("random ipfs nft url: ", tokenUrl)
            assert(tokenUrl, randomTokenUrls[0])
        })
    })

    describe("requestNft", function () {
        it("fails if payment isn't sent with the request", async function () {
            await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(
                randomIpfsNft,
                "RandomIpfsNft_NeedMoreETHsent",
            )
        })

        it("emits an event and kicks off a random word request", async function () {
            await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(randomIpfsNft, "NftRequested")
        })
    })

    describe.only("fulfillRandomWords", function () {
        it("mints NFT after random number is returned", async function () {
            console.log("Setting up Listener...")

            const promise = await new Promise(async (resolve, reject) => {
                try {
                    randomIpfsNft.once("NftMinted", async (tokenId, breed, minter) => {
                        console.log("NftMinted event fired!")
                        try {
                            console.log(`tokenId: ${tokenId}, breed: ${breed}, minter: ${minter}`)
                            // const tokenUrl = await randomIpfsNft.getTokenUrl(tokenId.toString())
                            // const dogUrl = await randomIpfsNft.getDogTokenUrl(breed.toString())
                            const tokenCounter = await randomIpfsNft.getTokenCounter()

                            // assert.equal(dogUrl.toString(), tokenUrl.toString())
                            assert.equal(tokenCounter.toString(), (tokenId + BigInt(1)).toString())
                            assert.equal(minter, deployer.address)
                            resolve()
                        } catch (e) {
                            console.error("Nftminted event Error: ", e)
                            reject(e)
                        }
                    })

                    console.log("Requesting NFT...")
                    const txResponse = await randomIpfsNft.requestNft({
                        value: mintFee.toString(),
                    })
                    const txReceipt = await txResponse.wait(1)
                    const requestId = txReceipt.logs[1].args.requestId
                    console.log("requestId: ", requestId.toString())
                    await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, randomIpfsNft.target)
                    console.log("Requesting NFT Done...")
                } catch (e) {
                    console.error("requestNft Error: ", e)
                    reject(e)
                }
            })

            // Set timeout for promise completion
            await Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded")), 500000)), // 500 seconds
            ])
        })
    })
})
