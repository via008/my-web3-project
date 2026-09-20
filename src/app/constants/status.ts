export enum TxStatus {
    Pending = 'pending', // 待确认（链接钱包中）
    Confirmed = 'confirmed', // 已确认（已链接钱包且用户确认）
    Rejected = 'rejected', // 已失败（用户拒绝交易）
    Loading = 'loading', // 上链等待验证
    Failed = 'failed', // 已失败（其他原因）
    Success = 'success', // 已成功
}

// 交易状态映射
export const TxStatusMap = {
    [TxStatus.Pending]: '待确认',
    [TxStatus.Confirmed]: '已确认',
    [TxStatus.Rejected]: '已拒绝',
    [TxStatus.Loading]: '上链等待验证',
    [TxStatus.Failed]: '已失败',
    [TxStatus.Success]: '已成功',
}