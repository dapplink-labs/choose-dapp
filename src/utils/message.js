/**
 * 重写 ElMessage，防止重复点击重复弹出 message 消息提示
 * 
 * 原理：
 * 1. 使用单例模式，同一时间只显示一个消息
 * 2. 新消息会立即关闭旧消息并显示
 * 3. 避免消息叠加的问题
 */
import { ElMessage } from 'element-plus'

let messageInstance = null

const resetMessage = (options) => {
  // 如果已有消息实例，先关闭它
  if (messageInstance) {
    messageInstance.close()
  }
  // 创建新的消息实例
  messageInstance = ElMessage(options)
  return messageInstance
}

// 为每种类型创建便捷方法
const message = {
  success: (message, options = {}) => {
    return resetMessage({
      message,
      type: 'success',
      ...options
    })
  },
  
  warning: (message, options = {}) => {
    return resetMessage({
      message,
      type: 'warning',
      ...options
    })
  },
  
  error: (message, options = {}) => {
    return resetMessage({
      message,
      type: 'error',
      ...options
    })
  },
  
  info: (message, options = {}) => {
    return resetMessage({
      message,
      type: 'info',
      ...options
    })
  },

  // 直接调用（兼容 ElMessage 的原始用法）
  default: (options) => {
    return resetMessage(options)
  }
}

// 支持直接调用 message(options) 或 message({ message: 'xxx', type: 'success' })
const messageFunc = (options) => {
  if (typeof options === 'string') {
    return resetMessage({ message: options })
  }
  return resetMessage(options)
}

// 将便捷方法挂载到 messageFunc 上
Object.keys(message).forEach(type => {
  messageFunc[type] = message[type]
})

export default messageFunc
