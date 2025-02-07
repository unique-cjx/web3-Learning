import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "@web3uikit/core"

export default function LotteryEntrance() {
    const { isWeb3Enabled, chainId: chainIdHex, provider } = useMoralis()
    const chainId = parseInt(chainIdHex)
    // console.log("You connected chain ID is: ", parseInt(chainId))

    let raffleAddress = contractAddresses[chainId]
    if (!raffleAddress) {
        raffleAddress = contractAddresses[31337] // localhost
    }

    const [enFee, setEnFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: enFee,
        params: {},
    })

    /* Get about valuables lattery contract */

    // Get the entrance fee
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    // Get the number of players
    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    // Get the recent winner
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIVlues() {
        // get actions
        const enFeeFormCall = (await getEntranceFee()).toString()
        const numberOfPlayersCall = (await getPlayersNumber()).toString()
        const recentWinnerCall = await getRecentWinner()

        // set actions
        setEnFee(enFeeFormCall)
        setNumberOfPlayers(numberOfPlayersCall)
        setRecentWinner(recentWinnerCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIVlues()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        console.log("Listening for WinnerPicked event...")
        const ethersProvider = new ethers.providers.Web3Provider(provider)
        const contract = new ethers.Contract(raffleAddress, abi, ethersProvider)
        const winnerPickedFilter = contract.filters.WinnerPicked()

        const setupListener = async () => {
            const currentBlock = await ethersProvider.getBlockNumber()

            const listener = async (winner, event) => {
                if (event.blockNumber <= currentBlock) {
                    console.log(
                        `Skipping historical event from block. current block: ${currentBlock}, event block: ${event.blockNumber}`
                    )
                    return
                }

                console.log("WinnerPicked event detected!", winner)
                const addr = winner.slice(0, 6) + "..." + winner.slice(winner.length - 4)
                dispatch({
                    type: "info",
                    title: "A winner has been picked",
                    message: "Congratulations to " + addr,
                    position: "topR",
                })
                updateUIVlues()
            }

            contract.on(winnerPickedFilter, listener)
        }

        setupListener()
    }, [isWeb3Enabled, raffleAddress, provider])

    const popNotification = (isOK) => {
        if (!isOK) {
            dispatch({
                type: "error",
                title: "Transaction Notification",
                message: "You have not entered the raffle!",
                position: "topR",
            })
        } else {
            dispatch({
                type: "success",
                title: "Transaction Notification",
                message: "You have entered the raffle!",
                position: "topR",
                icon: "🎉",
            })
        }
    }

    const handleNotification = async (tx) => {
        try {
            await tx.wait(1)
            popNotification(true)
            updateUIVlues()
        } catch (err) {
            console.error(err)
            popNotification(false)
        }
    }

    return (
        <div>
            {raffleAddress ? (
                <div>
                    <div class="ml-auto py-2 px-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto transition duration-300"
                            onClick={async function () {
                                await enterRaffle({
                                    onSuccess: handleNotification,
                                    onError: (err) => {
                                        console.log("Detailed error object:", err)
                                        popNotification(false)
                                    },
                                })
                            }}
                            text="Enter Raffle"
                            theme="primary"
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Enter Raffle"
                            )}
                        </button>
                    </div>

                    <div className="space-y-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
                        <div className="text-xl font-bold text-gray-900">
                            Entrance Fee:{" "}
                            <span className="text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                {ethers.utils.formatUnits(enFee)} ETH
                            </span>
                        </div>

                        <div className="text-xl font-semibold text-gray-800">
                            Players:{" "}
                            <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                {numberOfPlayers}
                            </span>
                        </div>

                        <div className="text-xl font-medium text-gray-800">
                            Previous Winner: <br />
                            <span className="text-blue-600 font-mono bg-blue-50 p-2 rounded block mt-1 overflow-auto">
                                {recentWinner}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <Typography variant="body16" style={{ color: "#CD5C5C" }}>
                        No Raffle Address Detected
                    </Typography>
                </div>
            )}
        </div>
    )
}
