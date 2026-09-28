import { Button, Form, Input, message } from "antd";
import { publicClient, walletClient } from "@/app/common/client"
import { useEffect, useMemo, useState } from "react";
import { sepolia, mainnet } from "viem/chains";
import { recoverMessageAddress } from "viem";

export function WalletLab() {
    const [address, setAddress] = useState<`0x${string}`>()
    const [chainId, setChainId] = useState<number>()
    const [signRes, setSignRes] = useState<string>()
    const [form] = Form.useForm()

    useEffect(() => {
        walletClient.getAddresses().then((addresses) => {
            setAddress(addresses[0])
        })
        walletClient.getChainId().then((chainId) => {
            setChainId(chainId)
        })
    }, [])

    const curChain = useMemo(() => {
        return chainId === sepolia.id ? 'sepolia' : 'mainnet'
    }, [chainId])

    const handleSwitch = async () => {
        try {
            await walletClient.switchChain({
                id: curChain === 'sepolia' ? mainnet.id : sepolia.id,
            })

            const newChainId = await walletClient.getChainId();
            setChainId(newChainId)
        } catch (error) {
            message.error('切换失败')
            console.log(error)
        }
    }

    const handleSignEIP191 = async () => {
        if (!address) {
            message.error('请先连接钱包')
            return
        }
        try {
            // EIP-191 签名
            const res = await walletClient.signMessage({ account: address, message: form.getFieldValue('message') })
            // 验证
            const valid = await publicClient.verifyMessage({
                address,
                message: form.getFieldValue('message'),
                signature: res,
            })
            if (!valid) {
                message.error('签名失败')
                return
            }
            message.success('签名成功')
            setSignRes(res)

            const addr = await recoverMessageAddress({
                message: form.getFieldValue('message'),
                signature: res,
            })
            message.success(`恢复地址成功：${addr}`)
        } catch (error) {
            message.error('签名失败')
            console.log(error)
        }
    }

    const handleSignEIP712 = async () => {
         if (!address) {
            message.error('请先连接钱包')
            return
        }
        try {
            // EIP-712 结构化签名
            const res = await walletClient.signTypedData({
                account: address,
                domain: { chainId },
                types: {
                    Mail: [
                        { name: "from", type: "address" },
                        { name: "to", type: "address" },
                        { name: "contents", type: "string" },
                    ],
                },
                primaryType: 'Mail',
                message: {
                    from: address,
                    to: address,
                    contents: form.getFieldValue('message'),
                }
            })
            // 验证
            const valid = await publicClient.verifyTypedData({
                address,
                domain: { chainId },
                types: {
                    Mail: [
                        { name: "from", type: "address" },
                        { name: "to", type: "address" },
                        { name: "contents", type: "string" },
                    ],
                },
                primaryType: 'Mail',
                message: {
                    from: address,
                    to: address,
                    contents: form.getFieldValue('message'),
                },
                signature: res,
            })
            if (!valid) {
                message.error('签名失败')
                return
            }
            message.success('签名成功')
            setSignRes(res)
        } catch (error) {
            message.error('签名失败')
            console.log(error)
        }
    }

    return <div className="m-5 space-y-6">
        <div>
            <span className="font-bold">Address: </span>
            {address}
        </div>
        <div>
            <span className="font-bold">ChainId: </span>
            {chainId}（{curChain}）
        </div>
        <div>
            <Button onClick={handleSwitch}>切换到 {curChain === 'sepolia' ? 'mainnet' : 'sepolia'}</Button>
        </div>
        <div className="flex items-end gap-2">
            <Form form={form}>
                <Form.Item name="message" label="Message">
                    <Input placeholder="user message" />
                </Form.Item>
            </Form>
            <Button className="mb-6" onClick={handleSignEIP191}>EIP-191签名</Button>
            <Button className="mb-6" onClick={handleSignEIP712}>EIP-712签名</Button>
        </div>
        {signRes && <div>
            <span className="font-bold">Sign Res: </span>
            {signRes}
        </div>}
    </div>
}