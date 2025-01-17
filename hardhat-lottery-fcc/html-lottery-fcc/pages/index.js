import Head from "next/head"
import { useMoralis } from "react-moralis"
import { Typography } from "@web3uikit/core"

import styles from "@/styles/Home.module.css"
import Header from "@/components/Header"
import LotteryEntrance from "@/components/LotteryEntrance"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const supportedChains = ["31337", "11155111"]

    return (
        <div className={styles.container}>
            <Head>
                <title>Smart Contract Lottery</title>
                <meta name="description" content="Our smart contract lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            {isWeb3Enabled ? (
                <div>
                    {supportedChains.includes(parseInt(chainId).toString()) ? (
                        <div className="flex flex-row">
                            <LotteryEntrance className="p-8" />
                        </div>
                    ) : (
                        <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
                    )}
                </div>
            ) : (
                <Typography variant="subtitle1" style={{ color: "#e31b1b" }}>
                    Please connect to a Wallet
                </Typography>
            )}
        </div>
    )
}
