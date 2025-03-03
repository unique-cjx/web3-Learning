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

    beforeEach(async function () {
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

    describe("fulfillRandomWords", function () {
        it("mints NFT after random number is returned", async function () {
            console.log("Setting up Listener...")

            await new Promise(async (resolve, reject) => {
                try {
                    randomIpfsNft.once("NftMinted", async (tokenId, breed, minter) => {
                        console.log("NftMinted event fired!")
                        try {
                            console.log(`tokenId: ${tokenId}, breed: ${breed}, minter: ${minter}`)
                            const tokenUrl = await randomIpfsNft.tokenURI(tokenId.toString())
                            const dogUrl = await randomIpfsNft.getDogTokenUrl(breed.toString())
                            const tokenCounter = await randomIpfsNft.getTokenCounter()

                            assert.equal(dogUrl.toString(), tokenUrl.toString())
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
        })
    })

    describe.only("getBreedFromModdedRng", function () {
        it("should return pug if moddedRng < 10", async function () {
            const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
            assert.equal(0, expectedValue)
        })
        it("should return shiba-inu if moddedRng is between 10 and 39", async function () {
            const expectedValue = await randomIpfsNft.getBreedFromModdedRng(10)
            assert.equal(1, expectedValue)
        })
        it("should return st. bernard if moddedRng is between 40 and 139", async function () {
            const expectedValue = await randomIpfsNft.getBreedFromModdedRng(100)
            assert.equal(2, expectedValue)
        })
        it("should revert if moddedRng > 140", async function () {
            await expect(randomIpfsNft.getBreedFromModdedRng(140)).to.be.revertedWithCustomError(
                randomIpfsNft,
                "RandomIpfsNft__RangeOutOfBreeds",
            )
        })
    })
})
