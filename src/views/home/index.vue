<template>
  <component :is="isMobile ? HomeMobile : HomePC" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HomePC from './indexPC.vue'
import HomeMobile from './indexMobile.vue'

const isMobile = ref(false)

const updateIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
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
