import { useCallback } from "react"
import { injected } from "wagmi"
import { useConnect, useConnection } from "wagmi"

export function useConnectWallet() {
    const { address, isConnected } = useConnection()
    const { mutateAsync } = useConnect()

    const connect = useCallback(async () => {
        try {
            if (!isConnected) {
                await mutateAsync({
                    connector: injected()
                })
            }
        } catch(error) {
            // 
            throw error
        }
        
    }, [isConnected, mutateAsync])

    return { connect, address }
}