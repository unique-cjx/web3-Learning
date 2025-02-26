const { testTokenURL } = require("../helper-hardhat-config")
const { uploadMeToken } = require("../utils/pinata")

async function main() {
    if (testTokenURL.length > 0) {
        console.warn("Token has already existed!!!")
        return
    }

    const upload = await uploadMeToken("../images/me.jpg")
    console.log(`get uploaded the NFT URL: https://ipfs.io/ipfs/${upload.IpfsHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("main error:", error)
        process.exit(1)
    })
