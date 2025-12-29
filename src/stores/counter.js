import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


// 定义一个名为 'counter' 的 Pinia store
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const  visible=  ref(false)
  const isLogin  = ref(false)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count,visible ,isLogin,doubleCount, increment }
})
