import { parseGwei, encodeFunctionData } from 'viem'
import { ElMessage } from 'element-plus'
import { readContract, estimateFeesPerGas, estimateGas, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../wagmi.ts'
import erc20ABI from "@/assets/abi/erc20ABI.json"

// 手动定义 maxUint256
export const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

/**
 * 安全的 BigInt 转换函数
 */
export function safeBigInt(value) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return BigInt(value)
    } catch (error) {
      throw new Error(`Invalid amount format: ${value}`)
    }
  }
  throw new Error(`Unsupported amount type: ${typeof value}`)
}

/**
 * 检查是否为用户拒绝错误
 */
export function isUserRejectedError(error) {
  return (
    error.info?.error?.code === 4001 ||
    error.code === 4001 ||
    error.message?.includes('User rejected') ||
    error.message?.includes('user rejected') ||
    error.message?.includes('User denied') ||
    error.message?.includes('cancelled')
  )
}

/**
 * 精确的 gas 预估函数 (带 20% Buffer)
 */
export async function computedGas(abi, functionName, args, to, account, value = undefined) {
  try {
    const feesPerGas = await estimateFeesPerGas(config)
    const gas = await estimateGas(config, {
      data: encodeFunctionData({ abi, functionName, args }),
      to: to,
      account: account,
      maxFeePerGas: feesPerGas.maxFeePerGas,
      maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas,
      ...(value && { value })
    })

    // 添加 20% 缓冲来应对波动
    const gasWithBuffer = (gas * BigInt(120)) / BigInt(100)

    return {
      gas: gasWithBuffer,
      maxFeePerGas: feesPerGas.maxFeePerGas,
      maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas
    }
  } catch (error) {
    console.error('Gas estimation failed, using fallback values:', error)
    return {
      gas: BigInt(1000000), // 默认 100 万 gas
      maxFeePerGas: parseGwei('5'), // BSC 默认较低
      maxPriorityFeePerGas: parseGwei('1')
    }
  }
}

/**
 * 检查 ERC20 代币授权额度
 */
export async function checkAllowance(tokenAddress, ownerAddress, spenderAddress) {
  try {
    // 安全校验：防止地址无效导致的 invalid opcode
    if (!tokenAddress || !tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
      console.warn('checkAllowance: Invalid tokenAddress', tokenAddress)
      return BigInt(0)
    }

    const allowanceResult = await readContract(config, {
      address: tokenAddress,
      abi: erc20ABI,
      functionName: 'allowance',
      args: [ownerAddress, spenderAddress]
    })
    return BigInt(allowanceResult || 0)
  } catch (error) {
    console.error('Failed to check allowance:', error)
    return BigInt(0)
  }
}

/**
 * 执行 ERC20 代币授权
 */
export async function approveToken({
  tokenAddress,
  spenderAddress,
  amount,
  userAddress,
  useExactApproval = true,
  BRIDGE_MESSAGES = { approvalSuccess: 'Success', userCancelledAuth: 'Cancelled', approveTokenFailed: 'Failed' }
}) {
  try {
    const amountBigInt = safeBigInt(amount)
    const approvalAmount = useExactApproval ? amountBigInt : maxUint256

    const gasEstimate = await computedGas(erc20ABI, 'approve', [spenderAddress, approvalAmount], tokenAddress, userAddress)

    const hash = await writeContract(config, {
      abi: erc20ABI,
      address: tokenAddress,
      functionName: 'approve',
      args: [spenderAddress, approvalAmount],
      gas: gasEstimate.gas,
      maxFeePerGas: gasEstimate.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas
    })

    const receipt = await waitForTransactionReceipt(config, { hash })
    if (receipt.status === 'reverted') throw new Error('Approve failed.')

    ElMessage.success(BRIDGE_MESSAGES.approvalSuccess)
    return hash
  } catch (error) {
    if (isUserRejectedError(error)) throw new Error(BRIDGE_MESSAGES.userCancelledAuth)
    throw new Error(BRIDGE_MESSAGES.approveTokenFailed + (error.message || error))
  }
}

/**
 * 获取用户特定代币的余额
 */
export async function getUserTokenBalance(tokenAddress, userAddress, functionName) {
  try {
    if (!tokenAddress || !userAddress) return BigInt(0)

    const balance = await readContract(config, {
      address: tokenAddress,
      abi: erc20ABI,
      functionName: functionName,
      args: [userAddress]
    })
    return BigInt(balance || 0)
  } catch (error) {
    console.error('Failed to fetch balance:', error)
    return BigInt(0)
  }
}

/**
 * 统一的优化合约写入函数
 */
export async function writeContractOptimized({
  abi,
  address,
  functionName,
  args,
  userAddress,
  value = undefined,
  messages = { success: 'Transaction Successful', failed: 'Transaction Failed', rejected: 'User Cancelled' },
  setTxHash,
  showErrorToast = true // 允许调用方关闭报错弹窗
}) {
  try {
    const gasEstimate = await computedGas(abi, functionName, args, address, userAddress, value)

    const hash = await writeContract(config, {
      abi,
      address,
      functionName,
      args,
      value,
      gas: gasEstimate.gas,
      maxFeePerGas: gasEstimate.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas
    })

    if (setTxHash) setTxHash(hash)

    const receipt = await waitForTransactionReceipt(config, { hash })

    if (receipt.status === 'success') {
      ElMessage.success(messages.success)
      return { success: true, hash, receipt }
    } else {
      throw new Error(messages.failed)
    }
  } catch (error) {
    if (showErrorToast) {
      if (isUserRejectedError(error)) {
        ElMessage.warning(messages.rejected)
      } else {
        ElMessage.error(error.message || messages.failed)
      }
    }
    throw error
  }
}