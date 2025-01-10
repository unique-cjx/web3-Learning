import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Typography } from "@web3uikit/core"

export default function LotteryEntrance() {
    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("you connected chain ID is: ", parseInt(chainId))

    let raffleAddress = contractAddresses[chainId]
    if (!raffleAddress) {
        raffleAddress = contractAddresses[31337] // localhost
    }

    const [enFee, setEnFee] = useState(0)

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    useEffect(() => {
        async function updateUI() {
            const enFeeFormCall = (await getEntranceFee()).toString()
            setEnFee(ethers.utils.formatUnits(enFeeFormCall))
            console.log("Entrance fee is: ", enFee)
        }
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <Typography variant="body18" style={{ color: "#D69700" }}>
                Entrance Fee: {enFee} ETH
            </Typography>
        </div>
    )
}
