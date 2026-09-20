import { Button, Col, Form, Input, InputNumber, Row } from "antd";
import { useEffect, useState } from "react";
import { formatEther, parseEther, parseEventLogs, parseUnits, TransactionReceipt } from "viem";
import { walletClient, account, publicClient } from "@/app/common/client"
import { TxStatus, TxStatusMap } from "@/app/constants/status";
import { USDC_ABI } from "@/app/constants/constract/USDC_ABI";
import { USDC_ADDRESS } from "@/app/constants";

export function Playground() {
    const [form] = Form.useForm();
    const [txHash, setTxHash] = useState<`0x${string}`>()
    const [status, setStatus] = useState<TxStatus>()
    const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const { gasUsed, blockNumber, logs } = txReceipt || {}

    useEffect(() => {
        if (txHash) {
            setStatus(TxStatus.Loading)
            publicClient.waitForTransactionReceipt({
                hash: txHash,
            }).then((res) => {
                const { status } = res
                setTxReceipt(res)
                if (status === 'success') {
                    setStatus(TxStatus.Success)
                } else {
                    setStatus(TxStatus.Failed)
                }
            }).catch((error) => {
                setStatus(TxStatus.Failed)
            })
        }
    }, [txHash])

    const handleFinish = async (values: Record<string, any>) => {
        const { to, data, value, gasLimit, nonce } = values
        setStatus(TxStatus.Pending)
        try {
            const decimal = await publicClient.readContract({
                account,
                address: USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: 'decimals',
            })
            const { request } = await publicClient.simulateContract({
                account,
                address: USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: 'transfer',
                args: [to, parseUnits(value.toString(), Number(decimal))],
                nonce,
            })
            const hash = await walletClient.writeContract(request)
            setStatus(TxStatus.Confirmed)
            setTxHash(hash)
        } catch (error) {
            console.log('error', error)
            setStatus(TxStatus.Rejected)
        }
    }
    
    return (<div>
        <Form onFinish={handleFinish} form={form}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item rules={[{ required: true, message: '请输入地址' }]} label="to" name="to">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="data" name="data">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item rules={[{ required: true, message: '请输入金额' }]} label="value" name="value">
                        <InputNumber />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="gasLimit" name="gasLimit">
                        <InputNumber />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="nonce" name="nonce">
                        <InputNumber />
                    </Form.Item>
                </Col>
            </Row>
            <div className="space-x-4">
                <Button type="primary" htmlType="submit">Submit</Button>
            </div>

            <div className="mt-4">
                {txHash && <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">etherscan链接</a>}
            </div>
            {status && <div className="mt-4">
                当前状态：{TxStatusMap[status]}
            </div>}

            {status === TxStatus.Success && <div className="mt-4 p-4 rounded-md border border-[#e9ecef] bg-white space-y-2">
               {gasUsed && <div>gasUsed: {formatEther(gasUsed)}</div>}
                <div>blockNumber: {blockNumber}</div>
                {logs && <div>logs:
                    <div> {JSON.stringify(logs, (_, value) =>
                        typeof value === 'bigint' ? `${value}n` : value,
                    2)}</div>
                    <div> {JSON.stringify(parseEventLogs({ abi: USDC_ABI, logs }), (_, value) =>
                        typeof value === 'bigint' ? `${value}n` : value,
                    2)}</div>
                </div>}
            </div>}
        </Form>
    </div>)
}