import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


// 定义一个名为 'counter' 的 Pinia store
export const useCounterStore = defineStore('counter', () => {
  // 计数器
  const count = ref(0)
  // 是否显示弹窗
  const  visible=  ref(false)
  // 是否登录
  const isLogin  = ref(false)
  // 是否显示邀请码弹窗
  const showInvite = ref(false)
  // 邀请码
  const inviteCode = ref('')
  // 双倍计数器
  const doubleCount = computed(() => count.value * 2)
  // 增加计数器
  function increment() {
    count.value++
  }

  return { count,visible ,isLogin,doubleCount, increment, showInvite, inviteCode }
})
