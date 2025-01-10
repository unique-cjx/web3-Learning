const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network, ethers } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await writeContractAddresses()
        await writeAbi()
        console.log("Front end written!")
    }
}

async function writeAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(frontEndAbiFile, raffle.interface.formatJson())
}

async function writeContractAddresses() {
    const address = (await ethers.getContract("Raffle")).target
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    const chanId = network.config.chainId.toString()

    for (const key in contractAddresses) {
        if (key === chanId) {
            console.log(`writing chainId: ${key}, address: ${address}`)
            contractAddresses[chanId] = address
        }
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
