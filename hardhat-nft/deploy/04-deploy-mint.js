const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // MeNFT
    const basicNft = await ethers.getContract("MeNFT", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`MeNFT token URI: ${await basicNft.tokenURI(0)}`)
    console.log("----------------------------------------------------------")

    // Dynamic SVG  NFT
    // const highValue = ethers.parseEther("0.01")
    // const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    // const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    // await dynamicSvgNftMintTx.wait(1)
    // console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
    // console.log("----------------------------------------------------------")

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const txResponse = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const txReceipt = await txResponse.wait(1)
    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async (tokenId, breed, minter) => {
            console.log(`tokenId: ${tokenId}, breed: ${breed}, minter: ${minter}`)
            console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            console.log("----------------------------------------------------------")
            resolve()
        })

        if (chainId == 31337) {
            const requestId = txReceipt.logs[1].args.requestId
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.target)
        }
    })
}
module.exports.tags = ["all", "mint"]
