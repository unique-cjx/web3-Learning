import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Typography, Button, useNotification } from "@web3uikit/core"

export default function LotteryEntrance() {
    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("You connected chain ID is: ", parseInt(chainId))

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

    const PopNotification = (isOK) => {
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
            PopNotification(true)
            updateUIVlues()
        } catch (err) {
            console.error(err)
            PopNotification(false)
        }
    }

    return (
        <div>
            {raffleAddress ? (
                <div>
                    <Button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleNotification,
                                onError: (err) => {
                                    console.log("Detailed error object:", err)
                                    PopNotification(false)
                                },
                            })
                        }}
                        text="Enter Raffle"
                        theme="primary"
                    />
                    <Typography variant="body16" style={{ color: "#D69700" }}>
                        Entrance Fee: {ethers.utils.formatUnits(enFee)} ETH
                    </Typography>
                    <br />
                    <Typography variant="Caption14">The current number of players is: {numberOfPlayers}</Typography>
                    <br />
                    <Typography variant="Caption14">The most previous winner was: {recentWinner}</Typography>
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
