import { parseGwei, parseUnits, encodeFunctionData } from 'viem'
import Message from '@/utils/message'
import { readContract, estimateFeesPerGas, estimateGas, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../../wagmi.ts'
import erc20ABI from "@/assets/abi/erc20ABI"
import bridge from "@/assets/abi/bridgeABI"
const bridgeABI = bridge.abi

// 手动定义 maxUint256
const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

/**
 * 安全的 BigInt 转换函数
 */
function safeBigInt(value) {
  // 如果当前传入的amount金额已经是bigint类型，则直接返回
  if (typeof value === 'bigint') return value
  // 如果当前传入的金额为字符串或者数值类型，则尝试转换为bigint类型
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
function isUserRejectedError(error) {
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
 * 精确的 gas 预估函数
 * param {Array} abi - 合约 ABI
 * param {string} functionName - 合约函数名称
 * param {Array} args - 合约函数参数
 * param  {string} to - 合约地址
 * param  {string} account - 调用账户地址
 * param  {BigInt} value - 交易附带的 ETH 数量（可选）
 */
export async function computedGas(abi, functionName, args, to, account, value = undefined) {
  try {
    // estimateFeesPerGas 方法用于估算当前网络的最大费用和优先费用
    // estimateGas 方法用于估算执行特定交易所需的 GAS 数量
    // 结合这两个方法可以更准确地预估交易的总费用
    // config 是 wagmi 的配置对象，包含网络和钱包信息
    const feesPerGas = await estimateFeesPerGas(config)
    const gas = await estimateGas(config, {
      // encodeFunctionData 方法用于将函数名称和参数编码变成可传输的交易数据
      data: encodeFunctionData({
        abi,
        functionName,
        args,
      }),
      to: to,
      account: account,
      maxFeePerGas: feesPerGas.maxFeePerGas,// 传入估算的最大费用
      maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas,// 传入估算的最优费用
      ...(value && { value })
    })
    

    // 添加 20% 缓冲来应对高峰期的 gas 价格波动，以防止因 gas 不足而导致交易失败
    const gasWithBuffer = (gas * BigInt(120)) / BigInt(100)

    return {
      gas: gasWithBuffer, // 返回添加缓冲后的 gas 估算值
      maxFeePerGas: feesPerGas.maxFeePerGas,// 返回估算的最大费用
      maxPriorityFeePerGas: feesPerGas.maxPriorityFeePerGas// 返回估算的最优费用
    }
  } catch (error) {
    console.error('Gas estimation failed:', error)
    // 如果预估失败，返回默认值以确保交易能够继续进行
    // parseGwei 方法用于将gwei单位转换为wei单位
    return {
      gas: BigInt(2000000),// 默认返回 200 万 gas
      maxFeePerGas: parseGwei('20'),// 默认返回 20 gwei 的最大费用
      maxPriorityFeePerGas: parseGwei('2')// 默认返回 2 gwei 的最优费用
    }
  }
}
/**
 * 检查 ERC20 代币授权额度
 * param {string} tokenAddress - 代币合约地址
 * param {string} ownerAddress - 代币持有者地址
 * param {string} spenderAddress - 授权花费者地址
 */
export async function checkAllowance(tokenAddress, ownerAddress, spenderAddress) {
  try {
    // readContract 方法用于读取区块链上的合约数据
    // 这里调用 ERC20 合约的 allowance 方法来获取授权额度
    const allowanceResult = await readContract(config, {
      address: tokenAddress,
      abi: erc20ABI,
      functionName: 'allowance',// ERC20 标准的 allowance 方法
      args: [ownerAddress, spenderAddress]
    })
    // 返回授权额度，确保是 BigInt 类型
    return BigInt(allowanceResult || 0)
  } catch (error) {
    console.error('Failed to check allowance:', error)
    return BigInt(0)
  }
}

/**
 * 执行 ERC20 代币授权
 * param {string} tokenAddress - 代币合约地址
 * param {string} spenderAddress - 授权花费者地址
 * param {BigInt} amount - 授权金额
 * param {string} userAddress - 用户地址
 * param {boolean} useExactApproval - 是否使用精确授权金额
 * param {object} BRIDGE_MESSAGES - 国际化消息对象
 */
export async function approveToken({
  tokenAddress,
  spenderAddress,
  amount,
  userAddress,
  useExactApproval = true,
  BRIDGE_MESSAGES
}) {
  try {
    // 保证授权金额的类型正确
    const amountBigInt = safeBigInt(amount)
    // 根据 useExactApproval 参数决定授权金额是否为精确值或最大值
    const approvalAmount = useExactApproval ? amountBigInt : maxUint256
    
    console.log('📝 Submitting approval for:', approvalAmount.toString())
    
    // 预估授权交易的 gas
    const gasEstimate = await computedGas(
      erc20ABI,
      'approve',
      [spenderAddress, approvalAmount],
      tokenAddress,
      userAddress
    )
    
    // 执行授权交易
    // writeContract 方法用于向区块链上的合约发送交易
    const hash = await writeContract(config, {
      abi: erc20ABI,// ERC20 合约 ABI
      address: tokenAddress,// 代币合约地址
      functionName: 'approve',// ERC20 标准的 approve 方法，用于授权
      args: [spenderAddress, approvalAmount],// 授权参数
      gas: gasEstimate.gas,// 预估的 gas
      maxFeePerGas: gasEstimate.maxFeePerGas,// 预估的最大费用
      maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas// 预估的最优费用
    })
    // 返回交易哈希
    console.log('✅ Approval submitted:', hash)
    
    // 等待交易被区块链确认
    // waitForTransactionReceipt 方法用于等待交易被打包进区块并获取收据
    const receipt = await waitForTransactionReceipt(config, {
      hash: hash
    })
    
    // 检查交易状态
    // receipt.status 有以下状态：
    // 'success' - 交易成功
    // 'failed' - 交易失败
    // 'reverted' - 交易被回滚：通常是因为合约执行过程中出现错误
    if (receipt.status === 'reverted') {
      throw new Error('Approve failed.')
    }
    
    // 显示成功消息
    Message.success(BRIDGE_MESSAGES.approvalSuccess, {
      duration: 3000,
      showClose: true
    })
    
    return hash
  } catch (error) {
    console.error('❌ Approval error:', error)
    
    // 显示错误消息
    // isUserRejectedError 函数用于判断错误是否为用户拒绝操作
    if (isUserRejectedError(error)) {
      throw new Error(BRIDGE_MESSAGES.userCancelledAuth) // 使用国际化消息
    }
    throw new Error(BRIDGE_MESSAGES.approveTokenFailed + (error.message || error)) // 使用国际化消息
  }
}

/**
 * 优化的 ETH 桥接函数
 * param {BigInt} amount - 桥接金额
 * param {string} userAddress - 用户地址
 * param {string} bridgeContractAddress - 桥接合约地址
 * param {number} fromChainId - 源链 ID
 * param {number} targetChainId - 目标链 ID
 * param {string} destTokenAddress - 目标链代币地址
 * param {function} setTxHash - 设置交易哈希的回调函数
 * param {object} BRIDGE_MESSAGES - 国际化消息对象
 * 应对跨链交易高峰期 gas 价格波动较大的问题，提升成功率
 */
export async function bridgeEthOptimized({
  amount,
  userAddress,
  bridgeContractAddress,
  fromChainId,
  targetChainId,
  destTokenAddress,
  setTxHash,
  BRIDGE_MESSAGES
}) {
  try {
    // 确保金额类型正确
    const amountBigInt = safeBigInt(amount)
    
    console.log('🌉 Starting ETH bridge:', {
      amount: amountBigInt.toString(),
      fromChainId,
      targetChainId,
      destTokenAddress,
      userAddress
    })
    
    // 预估桥接交易的 gas
    const gasEstimate = await computedGas(
      bridgeABI,// 桥接合约 ABI
      'BridgeInitiateETH',// 桥接函数名称
      // 桥接函数参数，包括发送链 ID、接收链 ID、接收代币地址和用户地址
      [fromChainId, targetChainId, destTokenAddress, userAddress],
      bridgeContractAddress,// 桥接合约地址
      userAddress,// 用户地址
      amountBigInt// 交易附带的 ETH 数量
    )
    // 执行桥接交易
    const hash = await writeContract(config, {
      abi: bridgeABI,
      address: bridgeContractAddress,
      functionName: 'BridgeInitiateETH',
      args: [fromChainId, targetChainId, destTokenAddress, userAddress],
      value: amountBigInt,// 交易附带的 ETH 数量
      gas: gasEstimate.gas,
      maxFeePerGas: gasEstimate.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas
    })
    // 与同链交易多次确认不同，跨链交易通常只需要一次确认即可
    // 因此这里不再额外等待多次确认

    // 设置交易哈希，
    setTxHash && setTxHash(hash)
    console.log('✅ ETH bridge submitted:', hash)
    
    // 等待交易被区块链确认
    const receipt = await waitForTransactionReceipt(config, {
      hash: hash
    })
    
    if (receipt.status === 'success') {
    Message.success(BRIDGE_MESSAGES.bridgeSuccess, {
      duration: 3000,
        showClose: true
      })
      
      return {
        success: true,
        txHash: hash,
        receipt: receipt,
        message: BRIDGE_MESSAGES.bridgeSuccess
      }
    } else {
      throw new Error(BRIDGE_MESSAGES.bridgeFailed)
    }
    
  } catch (error) {
    console.error('❌ ETH bridge error:', error)
    
    // 处理用户拒绝错误
    if (isUserRejectedError(error)) {
    Message.warning(BRIDGE_MESSAGES.userRejected, {
      duration: 2000,
        showClose: true
      })
      throw new Error(BRIDGE_MESSAGES.userRejected)
    }
    
    Message.error(BRIDGE_MESSAGES.bridgeFailed, {
      duration: 2000,
      showClose: true
    })
    
    throw error
  }
}

/**
 * 优化的 ERC20 桥接函数
 * param {string} tokenAddress - 源链代币合约地址
 * param {string} destTokenAddress - 目标链代币合约地址
 * param {BigInt} amount - 桥接金额
 * param {string} userAddress - 用户地址
 * param {string} bridgeContractAddress - 桥接合约地址
 * param {number} fromChainId - 源链 ID
 * param {number} targetChainId - 目标链 ID
 * param {string} tokenName - 代币名称
 * param {function} setTxHash - 设置交易哈希的回调函数
 * param {function} setApprovalHash - 设置授权交易哈希的回调函数
 * param {object} BRIDGE_MESSAGES - 国际化消息对象
 * 应对跨链交易高峰期 gas 价格波动较大的问题，提升成功率
 */
export async function bridgeErc20Optimized({
  tokenAddress,
  destTokenAddress,
  amount,
  userAddress,
  bridgeContractAddress,
  fromChainId,
  targetChainId,
  tokenName,
  setTxHash,
  setApprovalHash,
  BRIDGE_MESSAGES
}) {
  try {
    const amountBigInt = safeBigInt(amount)
    
    console.log('🌉 Starting ERC20 bridge:', {
      tokenAddress,
      destTokenAddress,
      amount: amountBigInt.toString(),
      fromChainId,
      targetChainId,
      tokenName,
      userAddress
    })
    
    // 1. 检查授权
    console.log('🔍 Checking allowance...')
    // checkAllowance 函数用于检查用户对桥接合约的代币授权额度
    const allowance = await checkAllowance(tokenAddress, userAddress, bridgeContractAddress)
    // allowance 小于桥接金额则需要授权
    
    console.log('💰 Allowance check:', {
      current: allowance.toString(),
      required: amountBigInt.toString(),
      needsApproval: allowance < amountBigInt
    })
    
    // 2. 如果需要授权
    // allowance 小于 amount 则需要授权
    if (allowance < amountBigInt) {
      // approveToken 函数用于执行代币授权
      const approvalHash = await approveToken({
        tokenAddress,
        spenderAddress: bridgeContractAddress,
        amount: amountBigInt,
        userAddress,
        useExactApproval: true,
        BRIDGE_MESSAGES
      })
      // 输出授权交易哈希
      // 设置授权交易哈希
      setApprovalHash && setApprovalHash(approvalHash)
    }
    
    // 3. 执行桥接交易
    console.log('🌉 Submitting bridge transaction...')
    
    const args = [
      fromChainId,  // 发送链 ID
      targetChainId,// 接收链 ID
      userAddress,  // 接收地址
      tokenAddress, // 源链代币地址
      destTokenAddress ,// 目标链代币地址
      amountBigInt  // 桥接金额
    ]
    
    console.log(args)
    // 预估桥接交易的 gas
    const gasEstimate = await computedGas(
      bridgeABI,
      'BridgeInitiateERC20',
      args,
      bridgeContractAddress,
      userAddress
    )
    
    const hash = await writeContract(config, {
      abi: bridgeABI,
      address: bridgeContractAddress,
      functionName: 'BridgeInitiateERC20',
      args: args,
      gas: gasEstimate.gas,
      maxFeePerGas: gasEstimate.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas
    })
    
    setTxHash && setTxHash(hash)
    console.log('✅ ERC20 bridge submitted:', hash)
    
    const receipt = await waitForTransactionReceipt(config, {
      hash: hash
    })
    
    if (receipt.status === 'success') {
    Message.success(BRIDGE_MESSAGES.bridgeSuccess, {
      duration: 3000,
        showClose: true
      })
      
      return {
        success: true,
        txHash: hash,
        receipt: receipt,
        message: BRIDGE_MESSAGES.bridgeSuccess
      }
    } else {
      throw new Error(BRIDGE_MESSAGES.bridgeFailed)
    }
    
  } catch (error) {
    console.error('❌ ERC20 bridge error:', error)
    
    if (isUserRejectedError(error)) {
    Message.warning(BRIDGE_MESSAGES.userRejected, {
      duration: 2000,
        showClose: true
      })
      throw new Error(BRIDGE_MESSAGES.userRejected)
    }
    
    Message.error(BRIDGE_MESSAGES.bridgeFailed, {
      duration: 2000,
      showClose: true
    })
    
    throw error
  }
}

/**
 * 统一的桥接方法
 * param {string} tokenName - 代币名称
 * param {string} tokenAddress - 源链代币合约地址
 * param {string} destTokenAddress - 目标链代币合约地址
 * param {BigInt} amount - 桥接金额
 * param {string} userAddress - 用户地址
 * param {string} bridgeContractAddress - 桥接合约地址
 * param {number} fromChainId - 源链 ID
 * param {number} targetChainId - 目标链 ID
 * param {function} setTxHash - 设置交易哈希的回调函数
 * param {function} setApprovalHash - 设置授权交易哈希的回调函数
 * param {object} BRIDGE_MESSAGES - 国际化消息对象
 * 根据代币类型选择合适的桥接方法
 */
export async function bridgeMethodOptimized({
  tokenName,
  tokenAddress,
  destTokenAddress,
  amount,
  userAddress,
  bridgeContractAddress,
  fromChainId,
  targetChainId,
  setTxHash,
  setApprovalHash,
  BRIDGE_MESSAGES
}) {
  try {
    // 修改判断逻辑
    // 是否使用优化的 ETH 桥接方法
    const shouldUseBridgeEthOptimized = 
      (fromChainId === 86606 && tokenName === "CP") ||  // cp chain 上跨链 CP 币
      (fromChainId !== 86606 && tokenName === "ETH")    // 除了 cp chain 以外的链跨链 ETH
    
      //shouldUseBridgeEthOptimized 为 true 则调用 bridgeEthOptimized 方法，否则调用 bridgeErc20Optimized 方法
    if (shouldUseBridgeEthOptimized) {
      return await bridgeEthOptimized({
        amount,
        userAddress,
        bridgeContractAddress,
        fromChainId,
        targetChainId,
        destTokenAddress,
        setTxHash,
        BRIDGE_MESSAGES
      })
    } else {
      return await bridgeErc20Optimized({
        tokenAddress,
        destTokenAddress,
        amount,
        userAddress,
        bridgeContractAddress,
        fromChainId,
        targetChainId,
        tokenName,
        setTxHash,
        setApprovalHash,
        BRIDGE_MESSAGES
      })
    }
  } catch (error) {
    console.error('❌ Bridge method error:', error)
    throw error
  }
}


