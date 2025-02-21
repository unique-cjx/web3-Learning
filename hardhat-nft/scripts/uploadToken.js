const { PinataSDK } = require("pinata-web3")
require("dotenv").config()

const fs = require("fs")
const path = require("path")
const { testTokenURL } = require("../helper-hardhat-config")

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
})

async function uploadToIPFS(imgPath) {
    imgPath = path.resolve(__dirname, imgPath)

    if (!fs.existsSync(imgPath)) {
        throw new Error(`File not found at path: ${imgPath}`)
    }
    const imageBuffer = fs.readFileSync(imgPath)

    try {
        const file = new File([imageBuffer], "me.jpg", { type: "image/jpeg" })
        const object = await pinata.upload.file(file).addMetadata({
            name: "me.jpg",
        })
        console.log("get uploaded raw object: ", object)

        const jsonObj = await pinata.upload
            .json({
                name: "me",
                description: "a handsome guy",
                image: "https://ipfs.io/ipfs/" + object.IpfsHash,
                attributtes: {
                    occupation: "developer",
                    age: 25,
                    interest: "CryptoCurrency",
                },
            })
            .addMetadata({
                name: "me.json",
            })
        return jsonObj
    } catch (error) {
        throw error
    }
}

async function main() {
    if (testTokenURL.length > 0) {
        console.warn("Token has already existed!!!")
        return
    }

    const upload = await uploadToIPFS("../images/me.jpg")
    console.log(`get uploaded the NFT URL: https://ipfs.io/ipfs/${upload.IpfsHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("main error:", error)
        process.exit(1)
    })
