import { USDC_ADDRESS } from "@/app/constants";
import { USDC_ABI } from "@/app/constants/constract/USDC_ABI";
import { ContractTransfer } from "../contract/transfer";

export function USDCWrite() {
    return <ContractTransfer abi={USDC_ABI} address={USDC_ADDRESS} />
}