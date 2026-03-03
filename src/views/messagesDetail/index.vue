<template>
  <div class="message-detail-page">
    <BackHeaderNav :title="$t('messages.detailTitle') || '消息详情'" />

    <div v-if="loading" class="detail-content detail-loading">
      {{ $t('common.loading') || '加载中...' }}
    </div>
    <div v-else-if="error" class="detail-content detail-error">
      {{ error }}
    </div>
    <div v-else class="detail-content">
      <h2 class="detail-title" v-html="title"></h2>
      <div class="detail-meta">
        <span class="detail-time">{{ time }}</span>
      </div>
      <div class="detail-body">
        <div class="detail-description" v-html="description"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { getNoticeData } from '@/api/API'
import { useAccount } from '@wagmi/vue'

const route = useRoute()
const { address } = useAccount()
const title = ref('')
const time = ref('')
const description = ref('')
const loading = ref(true)
const error = ref('')
const language = ref(localStorage.getItem('app-locale'))

async function fetchDetail() {
  const id = route.query.id ?? route.state?.id ?? ''
  loading.value = true
  error.value = ''
  try {
    const res = await getNoticeData({ address: address.value, language: language.value })
    const ann = res?.data?.announcement
    if (ann) {
      title.value = ann.title ?? ''
      time.value = ann.time ?? ''
      description.value = ann.content ?? ''
    } else {
      title.value = route.state?.title ?? route.query.title ?? ''
      time.value = route.state?.time ?? route.query.time ?? ''
      description.value = route.state?.description ?? route.query.description ?? ''
    }
  } catch (e) {
    title.value = route.state?.title ?? route.query.title ?? ''
    time.value = route.state?.time ?? route.query.time ?? ''
    description.value = route.state?.description ?? route.query.description ?? ''
    error.value = (e?.message || (typeof e === 'string' ? e : '')).toString() || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
watch(() => route.query.id, fetchDetail)
</script>

<style scoped lang="scss">
.message-detail-page {
  min-height: 100vh;
  background: var(--bg-page-h5);
  color: var(--bg-opposite);
  padding: 0;
  padding-top: 50px;
  box-sizing: border-box;
}

.detail-content {
  padding: 16px;
}

.detail-meta {
  margin-bottom: 16px;
}

.detail-time {
  font-size: 12px;
  color: var(--text-dark-gray);
}

.detail-body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-dark-gray);
}

.detail-description {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-loading,
.detail-error {
  color: var(--text-dark-gray);
  text-align: center;
  padding: 24px;
}
</style>
