import { USDC_ADDRESS } from "@/app/constants";
import { useConnectWallet } from "@/app/hooks/useConnectWallet";
import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { USDC_ABI } from "@/app/constants/constract/USDC_ABI";
import { useContractStore } from "@/app/store/contract";
import { useEffect } from "react";
import { ContractRead } from "../contract/read";

export function USDCRead() {
  const { address } = useConnectWallet();
  const result = useBalance({ address })
  const { isSuccess } = useContractStore();

  useEffect(() => {
    if (isSuccess) {
      result.refetch()
    }
  }, [isSuccess])

  return (
    <div className="pt-4">
      当前钱包信息：
      <div>Address: {address}</div>
      <div>ETH: {result?.data?.value ? formatEther(result?.data?.value) : '0'}</div>

      <ContractRead contracts={[
        {
          abi: USDC_ABI,
          address: USDC_ADDRESS,
          functionName: 'name',
        },
        {
          abi: USDC_ABI,
          address: USDC_ADDRESS,
          functionName: 'decimals',
        },
        {
          abi: USDC_ABI,
          address: USDC_ADDRESS,
          functionName: 'totalSupply',
        },
        {
          abi: USDC_ABI,
          address: USDC_ADDRESS,
          functionName: 'symbol',
        },
        {
          abi: USDC_ABI,
          address: USDC_ADDRESS,
          functionName: 'balanceOf',
          args: [address],
        },
      ]} />
    </div>
  )
}