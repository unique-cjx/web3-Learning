const { ethers, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

if (developmentChains.includes(network.name)) {
    return
}

describe("Raffle Staging", function () {
    let raffleContract, raffle, entranceFee, deployer

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]

        raffleContract = await ethers.getContract("Raffle")
        raffle = raffleContract.connect(deployer)
        entranceFee = await raffle.getEntranceFee()
    })

    describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and VRF, We get a random winner", async () => {
            const startingTimestamp = await raffle.getLastTimeStamp()
            let startingBalance

            console.log("Setting up Listener...")
            await new Promise(async (reslove, reject) => {
                try {
                    raffle.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event fired!")
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await ethers.provider.getBalance(deployer.address)
                            console.log("Winner Balance: ", winnerBalance)
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                            await expect(raffle.getPlayer(0)).to.be.reverted

                            // Comparisons to check if our ending values are correct:
                            assert.equal(recentWinner.toString(), deployer.address)
                            assert.equal(raffleState, 0) // 0 = open, 1 = calculating
                            assert.equal(winnerBalance, startingBalance + entranceFee)
                            assert(endingTimeStamp > startingTimestamp)

                            reslove()
                        } catch (e) {
                            console.error(e)
                            reject(e)
                        }
                    })

                    // Perform Upkeep and wait for transaction to be mined
                    console.log("Entering Raffle fee...")
                    const txReceipt = await raffle.enterRaffle({ value: entranceFee })
                    txReceipt.wait(1)
                    console.log("Entrance fee paid...")

                    startingBalance = await ethers.provider.getBalance(deployer.address)
                    console.log("Starting Balance: ", startingBalance)
                } catch (e) {
                    reject(e)
                }
            })
        })
    })
})
