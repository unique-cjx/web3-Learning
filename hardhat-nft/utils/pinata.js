require("dotenv").config()

const { PinataSDK } = require("pinata-web3")

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
})

const fs = require("fs")
const path = require("path")

async function storeImages(imgPath) {
    const folderPath = path.resolve(imgPath)

    // Filter the files in case there's a file that in not a .png, .jpg or .jpeg
    const files = fs.readdirSync(folderPath).filter((file) => /\b.png|\b.jpg|\b.jpeg/.test(file))

    console.log("Uploading to Pinata...")

    const responses = []

    for (const index in files) {
        let file = files[index]
        // const readableStreamForFile = fs.createReadStream(`${folderPath}/${files[file]}`)
        const imageBuffer = fs.readFileSync(`${folderPath}/${file}`)
        console.log(`waiting image ${file} to upload...`)

        try {
            const uploadFile = new File([imageBuffer], file, { type: "image/jpeg" })
            object = await pinata.upload.file(uploadFile).addMetadata({
                name: uploadFile.name,
            })
            responses.push(object)
        } catch (error) {
            console.log(error)
        }
    }

    return { responses, files }
}

async function uploadMeToken(imgPath) {
    imgPath = path.resolve(__dirname, imgPath)

    if (!fs.existsSync(imgPath)) {
        throw new Error(`File not found at path: ${imgPath}`)
    }
    const imageBuffer = fs.readFileSync(imgPath)

    try {
        const file = new File([imageBuffer], "me.jpg", { type: "image/jpeg" })
        const object = await pinata.upload.file(file).addMetadata({
            name: file.name,
        })
        console.log("get uploaded raw object: ", object)

        metadata = {
            name: "me",
            description: "a handsome guy",
            image: "https://ipfs.io/ipfs/" + object.IpfsHash,
            attributtes: {
                occupation: "developer",
                age: 25,
                interest: "CryptoCurrency",
            },
        }
        return await storeMetadataJson(metadata)
    } catch (error) {
        throw error
    }
}

async function storeMetadataJson(metadata) {
    let response
    try {
        response = await pinata.upload.json(metadata).addMetadata({
            name: metadata.name + ".json",
        })
    } catch (error) {
        console.error("Error storing metadata to Pinata")
    }
    return response
}

module.exports = { uploadMeToken, storeImages, storeMetadataJson }
