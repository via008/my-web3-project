import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: custom(window.ethereum),
})

export const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
})

// 可以请求用户授权连接钱包
export const [account] = await walletClient.requestAddresses()