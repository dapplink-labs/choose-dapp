<template>
  <component :is="isMobile ? BreakingMobile : BreakingPC" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BreakingPC from './indexPC.vue'
import BreakingMobile from './breakingMobile.vue'

const isMobile = ref(true)

const updateIsMobile = () => {
  if (typeof window !== 'undefined') {
    // isMobile.value = window.innerWidth <= 768
  }
}

onMounted(() => {
  updateIsMobile()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateIsMobile)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateIsMobile)
  }
})
</script>
