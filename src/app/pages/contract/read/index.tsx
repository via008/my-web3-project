import { useContractStore } from "@/app/store/contract";
import { useEffect } from "react";
import { Abi, formatUnits } from "viem";
import { useReadContracts } from "wagmi";

interface ContractReadConfig {
    abi?: any;
    address?: `0x${string}`;
    functionName?: string;
    args?: any[];
}

export function ContractRead({ contracts }: { contracts: ContractReadConfig[] }) {
    const { isSuccess } = useContractStore();
    
    const { data ,refetch } = useReadContracts({
        contracts,
    })

    useEffect(() => {
        if (isSuccess) {
            refetch()
        }
    }, [isSuccess, refetch])

    return <div className="border border-gray-300 p-4 rounded-md w-[600px] mt-4">
        <div>Name: {data?.[0]?.result as string}</div>
        <div>Decimals: {data?.[1]?.result as number}</div>
        <div>Symbol: {data?.[3]?.result as string}</div>
        <div className="mt-4">Total Supply: <div>{data?.[2]?.result as bigint}</div></div>
        <div className="mt-4">My Balance: <div>{data?.[4]?.result ? formatUnits(data?.[4]?.result as bigint, data?.[1]?.result as number) : '0'}</div></div>
    </div>
}