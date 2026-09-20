import { getContract } from "viem"
import { USDC_ABI } from "./constract/USDC_ABI"
import { publicClient, walletClient } from "../common/client"

export const RPC_URL = 'https://responsive-floral-market.ethereum-sepolia.quiknode.pro/ee8e7acb1b825f554952b622bb861a519cbe7eb4/'

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

export const USDC_contract = getContract({ address: USDC_ADDRESS, abi: USDC_ABI, client: { public: publicClient, wallet: walletClient } })

