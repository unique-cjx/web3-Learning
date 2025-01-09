import { useEffect } from "react"
import { useMoralis } from "react-moralis"

export default function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, isWeb3EnableLoading, account, Moralis, deactivateWeb3 } = useMoralis()

    // Function to enable Web3 if not already enabled
    const enableWeb3IfConnected = () => {
        if (!isWeb3Enabled && typeof window !== "undefined" && window.localStorage.getItem("connected")) {
            try {
                enableWeb3()
            } catch (error) {
                console.error("Failed to enable Web3:", error)
            }
        }
    }

    // Function to handle account changes
    const handleAccountChange = (newAccount) => {
        console.log(`Account changed to ${newAccount}`)
        if (newAccount == null) {
            window.localStorage.removeItem("connected")
            deactivateWeb3()
            console.log("Null Account found")
        }
    }

    useEffect(() => {
        console.log("isWeb3Enabled: ", isWeb3Enabled)
        console.log("account: ", account)
    })

    useEffect(() => {
        enableWeb3IfConnected()
    }, [isWeb3Enabled])

    useEffect(() => Moralis.onAccountChanged(handleAccountChange), [])

    return (
        <nav className="p-5 border-b-2">
            <ul className="">
                <li className="flex flex-row">
                    {account ? (
                        <div className="ml-auto py-2 px-4">
                            Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                        </div>
                    ) : (
                        <button
                            onClick={async () => {
                                if (!isWeb3EnableLoading) {
                                    try {
                                        const ret = await enableWeb3()
                                        console.log("ret:", ret)
                                        if (typeof window !== "undefined") {
                                            window.localStorage.setItem("connected", "injected")
                                        }
                                    } catch (error) {
                                        console.error("Failed to enable Web3:", error)
                                    }
                                }
                            }}
                            disabled={isWeb3EnableLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        >
                            Connect
                        </button>
                    )}
                </li>
            </ul>
        </nav>
    )
}
