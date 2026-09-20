import { Button, Form, Input, InputNumber } from "antd";
import { useConnectWallet } from "@/app/hooks/useConnectWallet";
import { parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { useEffect, useMemo } from "react";
import { useContractStore } from "@/app/store/contract";

interface ContractWriteConfig {
    abi: any;
    address: `0x${string}`;
}

export function ContractTransfer({ abi, address }: ContractWriteConfig) {
    const [form] = Form.useForm();
    const connect = useConnectWallet();
    const { setStatus } = useContractStore();
    const { 
        mutate,
        data,
        isPending: writeLoading,
        isError: writeIsError,
        failureReason: writeFailureReason,
    } = useWriteContract();
    const { 
        data: txData,
        isLoading: txLoading,
        isPending,
        isError,
        isSuccess,
        failureReason
    } = useWaitForTransactionReceipt({ chainId: sepolia.id, hash: data })
    
    const handleSubmit: () => Promise<void> = async () => {
        const values = await form.validateFields();
        await connect.connect()
        const amount = parseUnits(String(values.amount), 6)
        
        mutate({
            abi,
            address,
            functionName: 'transfer',
            args: [
                values.to,
                amount,
            ],
        })
    }

    const transferStatus = useMemo(() => {
        if (writeLoading) {
            return '钱包确认交易中'
        } else if (writeIsError) {
            return `连接钱包失败：${writeFailureReason}`
        }
            
        if (txLoading && isPending) {
            return '交易中'
        } else if (isError) {
            return `交易失败：${failureReason}`
        } else if (isSuccess) {
            return '交易成功'
        } else {
            return '未开始'
        }
    }, [writeLoading, txLoading, isPending, isError, isSuccess, failureReason, writeFailureReason])

    // 成功之后清空表单
    useEffect(() => {
        if (isSuccess) {
            form.resetFields();
            setStatus(true)
        }
    }, [isSuccess, setStatus])

    return <div className="border-t border-gray-300 pt-4">
        {/* 转帐区域 */}
        <Form form={form}>
            <Form.Item rules={[{ required: true, message: '请输入地址' }]} label="to" name="to">
                <Input />
            </Form.Item>
            <Form.Item rules={[{ required: true, message: '请输入金额' }]} label="amount" name="amount">
                <InputNumber />
            </Form.Item>
            <Button loading={writeLoading || txLoading} htmlType="submit" onClick={handleSubmit}>Transfer</Button>
        </Form>

        {/* 转账状态 */}
        <div className="mt-4">
            实时状态：{transferStatus}
        </div>

        {/* 成功之后显示跳转链接 */}
        {isSuccess && <div className="text-blue-500 underline">
            <a href={`https://sepolia.etherscan.io/tx/${txData?.transactionHash}`} target="_blank" rel="noopener noreferrer">查看交易详情</a>
        </div>}
    </div>
}