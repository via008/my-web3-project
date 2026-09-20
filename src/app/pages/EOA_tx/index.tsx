'use client'

import { useConnectWallet } from '@/app/hooks/useConnectWallet'
import { Button, Form, Input, InputNumber } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { injected, useConnection, useBalance, useBlockNumber, useConnect, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'

const FiveLatestTx: any[] = []
function get5LatestTx(transactionHash?: string, amount?: number, status?: string) {
  if (!transactionHash || !amount || !status) {
    return
  }

  FiveLatestTx.push({
    link: `https://sepolia.etherscan.io/tx/${transactionHash}`,
    amount,
    status,
  })
  if (FiveLatestTx.length > 5) {
    FiveLatestTx.shift()
  }
}

export function EOA_tx() {
    const [form] = Form.useForm()
    const connect = useConnectWallet()

    const { address, isConnected } = useConnection()
    const { mutate: connectAsync } = useConnect()
    const { mutate, data, isPending: isWalletLoading, isError: isWalletError, failureReason } = useSendTransaction()
    const { data: balance, refetch } = useBalance({ address, chainId: sepolia.id })
    const { data: txData, isLoading: txLoading, isPending, isError, isSuccess } = useWaitForTransactionReceipt({ chainId: sepolia.id, hash: data })

    const { blockHash, blockNumber, gasUsed, transactionHash, status: txStatus } = txData || {}
    const { data: currentBlockNumber, status: currentBlockNumberStatus } = useBlockNumber({ chainId: sepolia.id, watch: true })
    
    const handleSubmit = async (values: any) => {
        await connect.connect()
        mutate({
            to: values.to,
            value: parseEther(values.amount),
        })
    }

    // 交易状态
    const status = useMemo(() => {
    if (txLoading) {
        return '已广播，等待打包'
    }
    if (isPending) {
        return '发送'
    }
    if (isSuccess) {
        return '交易成功'
    }
    if (isError) {
        return '交易失败'
    }
    }, [txLoading, isPending, isError, isSuccess, refetch])

    useEffect(() => {
    if (isSuccess) {
        refetch()
    }
    }, [refetch, isSuccess, transactionHash])

    useEffect(() => {
    get5LatestTx(transactionHash, form.getFieldValue('amount'), txStatus)
    }, [transactionHash])

    // 按钮loading
    const btnLoading = useMemo(() => {
    return isWalletLoading || txLoading
    }, [isWalletLoading, txLoading])

    // 监听失败
    useEffect(() => {
        if (isWalletError) {
            console.log('failureReason', failureReason)
            alert(failureReason || '发送失败')
        }
    }, [isWalletError, failureReason])

  return (
    <div>
        <Form form={form} name="sendTransaction" onFinish={handleSubmit}>
        <div className='pb-5'>当前余额: {balance?.value ? formatEther(balance.value) : '0'}</div>
        <Form.Item rules={[{ required: true }]} name="to" label="接收地址"><Input /></Form.Item>
        <Form.Item rules={[{ required: true }]} name="amount" label="发送金额"><Input /></Form.Item>
        <Button loading={btnLoading} htmlType="submit" type="primary">{status}</Button>

        <div className='mt-4'>当前区块号: {currentBlockNumber}，状态: {currentBlockNumberStatus}</div>

        {FiveLatestTx.length > 0 &&<>
        <div className='mt-4 mb-2'>最近5笔交易:</div>
            <div className='flex flex-col gap-2'>
            {FiveLatestTx.map((tx, index) => (
                <div key={index} className='flex items-center gap-4'>
                <div>交易地址: <a href={tx.link} target="_blank" rel="noopener noreferrer">交易详情</a></div>
                <div>交易金额: {tx.amount}</div>
                <div>交易状态: {tx.status}</div>
                </div>
            ))}
            </div>
        </>}
        </Form>
    </div>
  )
}