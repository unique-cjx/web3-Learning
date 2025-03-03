const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) {
    return
}

describe("Raffle", function () {
    let raffleContract, raffle, vrfCoordinatorV2_5Mock, entranceFee, deployer, interval
    const chainId = network.config.chainId

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "raffle"])
        raffleContract = await ethers.getContract("Raffle")
        raffle = raffleContract.connect(deployer)
        vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")

        entranceFee = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
    })

    describe("constructor", function () {
        it("Initializes the raffle correctly", async function () {
            const raffleState = (await raffle.getRaffleState()).toString()
            const interval = (await raffle.getInterval()).toString()
            assert.equal(raffleState, "0")
            assert.equal(interval.toString(), networkConfig[chainId]["autoUpdateInterval"])
        })
    })

    describe("enterRaffle", function () {
        it("reverts when you don't pay ETH enough", async function () {
            await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered")
        })

        it("records players when they enter", async function () {
            await raffle.enterRaffle({ value: entranceFee })
            const contractPlayer = await raffle.getPlayer(0)
            assert.equal(contractPlayer, deployer.address)
        })

        it("emits event on enter", async function () {
            await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(raffle, "RaffleEnter")
        })

        it("doesn't allow entrance when raffle is calculating", async function () {
            await raffle.enterRaffle({ value: entranceFee })
            // for a documentation of the methods below, go here: https://hardhat.org/hardhat-network/reference
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })

            await raffle.performUpkeep("0x") // changes the state to calculating for our comparison below
            await expect(raffle.enterRaffle({ value: entranceFee })).to.be.revertedWithCustomError(
                raffle,
                // is reverted as raffle is calculating
                "Raffle__RaffleNotOpen",
            )
        })
    })

    describe("checkUpkeep", function () {
        it("returns false if people haven't sent any ETH", async () => {
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
            assert(!upkeepNeeded)
        })
        it("returns false if raffle isn't open", async () => {
            await raffle.enterRaffle({ value: entranceFee })
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            await raffle.performUpkeep("0x") // changes the state to calculating
            const raffleState = await raffle.getRaffleState() // stores the new state
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
        })
        it("returns false if enough time hasn't passed", async () => {
            await raffle.enterRaffle({ value: entranceFee })
            // use a higher number here if this test fails
            await network.provider.send("evm_increaseTime", [Number(interval) - 5])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(!upkeepNeeded)
        })
        it("returns true if enough time has passed, has players, eth, and is open", async () => {
            await raffle.enterRaffle({ value: entranceFee })
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(upkeepNeeded)
        })
    })

    describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async () => {
            await raffle.enterRaffle({ value: entranceFee })
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const tx = await raffle.performUpkeep("0x")
            assert(tx)
        })
        it("reverts if checkup is false", async () => {
            await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(
                raffle,
                // is reverted as raffle is calculating
                "Raffle__UpkeepNotNeeded",
            )
        })
        it("updates the raffle state and emits a requestId", async () => {
            // Too many asserts in this test!
            await raffle.enterRaffle({ value: entranceFee })
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const txResponse = await raffle.performUpkeep("0x") // emits requestId
            const txReceipt = await txResponse.wait(1) // waits 1 block
            const raffleState = await raffle.getRaffleState() // updates state
            const requestId = txReceipt.logs[1].args.requestId
            assert(Number(requestId) > 0)
            assert(raffleState == 1) // 0 = open, 1 = calculating
        })
    })

    describe("fulfillRandomWords", function () {
        beforeEach(async () => {
            await raffle.enterRaffle({ value: entranceFee })
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
        })

        it("can only be called after performupkeep", async () => {
            await expect(
                vrfCoordinatorV2_5Mock.fulfillRandomWords(0, raffle.target), // reverts if not fulfilled
            ).to.be.revertedWithCustomError(vrfCoordinatorV2_5Mock, "InvalidRequest")
            await expect(
                vrfCoordinatorV2_5Mock.fulfillRandomWords(1, raffle.target), // reverts if not fulfilled
            ).to.be.revertedWithCustomError(vrfCoordinatorV2_5Mock, "InvalidRequest")
        })

        it("picks a winner, resets, and sends money", async () => {
            const additionalEntrances = 3 // to test
            const startingIndex = 1 // deployer's index is 0
            const accounts = await ethers.getSigners()
            let startingBalance

            for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                const accountConnectRaffle = raffle.connect(accounts[i])
                await accountConnectRaffle.enterRaffle({ value: entranceFee })
            }

            const startingTimestamp = await raffle.getLastTimeStamp()

            // PerformUpkeep (mock being Chainlink keepers).
            // FulfillRandomWords (mock being the Chainlink VRF).
            // We'll have to wait for the FulfillRandomWords method to be called.
            console.log("Setting up Listener...")
            await new Promise(async (resolve, reject) => {
                try {
                    raffle.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event fired!")
                        try {
                            // Now lets get the ending values...
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await ethers.provider.getBalance(accounts[1].address)
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                            await expect(raffle.getPlayer(0)).to.be.reverted

                            // Comparisons to check if our ending values are correct:
                            assert.equal(recentWinner.toString(), accounts[1].address)
                            assert.equal(raffleState, 0) // 0 = open, 1 = calculating
                            assert.equal(
                                winnerBalance,
                                startingBalance + entranceFee * BigInt(additionalEntrances) + entranceFee,
                            )
                            assert(endingTimeStamp > startingTimestamp)
                            resolve()
                        } catch (e) {
                            console.error("WinnerPicked event Error: ", e)
                            reject(e)
                        }
                    })

                    // Perform Upkeep and wait for transaction to be mined
                    const txResponse = await raffle.performUpkeep("0x")
                    const txReceipt = await txResponse.wait(1) // waits 1 block
                    startingBalance = await ethers.provider.getBalance(accounts[1].address) // get the starting balance
                    await vrfCoordinatorV2_5Mock.fulfillRandomWords(txReceipt.logs[1].args.requestId, raffle.target)
                } catch (e) {
                    console.error("fulfillRandomWords Error: ", e)
                    reject(e)
                }
            })
        })
    })
})
