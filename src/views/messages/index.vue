<template>
  <div class="messages-page">
    <BackHeaderNav title="系统消息" />

    <div class="tabs-container top-tabs">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </div>
    </div>

    <div class="messages-list">
      <template v-for="(item, index) in filteredMessages" :key="index">
        <!-- 日期分隔符 -->
        <div v-if="item.isDateSeparator" class="date-separator">
          <span>{{ item.date }}</span>
        </div>

        <!-- 消息项 -->
        <div v-else class="message-item" @click="goToMessage(item)">
          <div class="message-icon-wrapper">
            <div class="icon-circle">
              <!-- 根据类型显示不同图标，这里示例使用 SVG -->
              <svg v-if="item.type === 'transaction'" xmlns="http://www.w3.org/2000/svg" width="40" height="40"
                viewBox="0 0 40 40">
                <g transform="translate(-10 -163)">
                  <circle fill="#212121" cx="20" cy="20" r="20" transform="translate(10 163)" />
                  <path fill="#909090"
                    d="M3.919,18.457H15a1.943,1.943,0,0,0,1.978-1.978V14.5a.659.659,0,0,1,1.319,0v1.978a3.264,3.264,0,0,1-3.3,3.3H3.393l2.439,2.439a.652.652,0,1,1-.923.922L1.679,19.908a.707.707,0,0,1-.2-.461.593.593,0,0,1,.2-.461L4.91,15.755a.652.652,0,1,1,.923.922Zm13.253-8.57H4.448A1.943,1.943,0,0,0,2.47,11.865v1.978a.622.622,0,0,1-.659.659.622.622,0,0,1-.659-.659V11.865a3.264,3.264,0,0,1,3.3-3.3H16.713L14.8,6.656a.652.652,0,1,1,.923-.922l3.231,3.3a.712.712,0,0,1,.2.461.6.6,0,0,1-.2.461l-3.231,3.231a.652.652,0,1,1-.923-.922l2.372-2.374Zm0,0"
                    transform="translate(19.848 168.464)" />
                </g>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <g transform="translate(-10 -163)">
                  <circle fill="#212121" cx="20" cy="20" r="20" transform="translate(10 163)" />
                  <path fill="#999"
                    d="M159.126,64.917a4.3,4.3,0,0,1,4.3,4.3v5.271l.387.413.808.862H153.636l.808-.862.387-.413V69.213a4.3,4.3,0,0,1,4.3-4.3m0-1.432a5.727,5.727,0,0,0-5.727,5.727v4.7l-1.131,1.206a1.227,1.227,0,0,0,.9,2.067h11.925a1.227,1.227,0,0,0,.9-2.067l-1.131-1.206v-4.7A5.727,5.727,0,0,0,159.126,63.485Zm1.432,14.523h-2.864a.716.716,0,1,0,0,1.432h2.864a.716.716,0,1,0,0-1.432Zm-.92-16.568h-1.023a.716.716,0,1,0,0,1.432h1.023a.716.716,0,1,0,0-1.432Z"
                    transform="translate(-128.935 112.56)" />
                </g>
              </svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-header-row">
              <h3 class="message-title">{{ item.title }}</h3>
              <div class="message-meta">
                <span class="message-time">{{ item.time }}</span>
                <span v-if="item.isUnread" class="unread-dot"></span>
              </div>
            </div>
            <p class="message-desc" v-html="item.description"></p>
          </div>
        </div>
      </template>

      <div v-if="filteredMessages.length === 0" class="empty">
        {{ $t('common.noData') || '暂无数据...' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { getAnnouncementList } from '@/api/APIEvent'
import { useAccount } from '@wagmi/vue'

const router = useRouter()
const { address } = useAccount()
const activeTab = ref('announcement')

const tabs = [
  // { key: 'all', label: '全部' },
  { key: 'announcement', label: '系统公告' },
  // { key: 'prediction', label: '预测' },
  // { key: 'staking', label: '质押' }
]

const messages = ref([])
const loading = ref(false)
const language = ref(localStorage.getItem('app-locale') || 'en')

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await getAnnouncementList({
      language: language.value,
      page: 1,
      page_size: 100,
      user_address: address.value || ''
    })
    
    if (res?.data?.code === 2000 && res.data.data?.list) {
      messages.value = res.data.data.list.map(item => ({
        id: item.guid,
        type: 'system',
        messageAction: 'detail',
        title: item.title,
        description: item.summary,
        time: item.created_at,
        isUnread: !item.is_read,
        category: 'announcement'
      }))
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessages()
})

watch(address, () => {
  fetchMessages()
})

const filteredMessages = computed(() => {

  return messages.value.filter(msg => {
    if (msg.isDateSeparator) return true
    if (activeTab.value === 'all') return true
    return msg.category === activeTab.value
  })
})

/** 根据消息类型跳转：充币/提币 -> 交易成功页，其他 -> 消息详情页 */
function goToMessage(item) {
  if (item.isDateSeparator || !item.messageAction) return
  if (item.messageAction === 'deposit_success') {
    router.push({
      path: '/transaction-success',
      query: {
        type: 'deposit',
        amount: item.amount || '100',
        currency: item.currency || 'USDT',
      },
    })
    return
  }
  if (item.messageAction === 'withdraw_success') {
    router.push({
      path: '/transaction-success',
      query: {
        type: 'withdraw',
        amount: item.amount || '50',
        currency: item.currency || 'USDT',
      },
    })
    return
  }
  // detail：跳转消息详情页，传递 id 供详情页根据 id 调接口
  router.push({
    path: '/message-detail',
    query: { id: item.id },
    state: {
      id: item.id,
      title: item.title,
      description: item.description,
      time: item.time,
    },
  })
}
</script>

<style scoped lang="scss">
.messages-page {
  min-height: 100vh;
  background: var(--bg-page-h5);
  color: var(--bg-opposite);
  padding: 0;
  /* 为固定头部预留高度（BackHeaderNav 固定定位） */
  padding-top: 50px;
  box-sizing: border-box;

  .messages-header {
    position: sticky;
    top: 0;
    background: var(--bg-page-h5);
    z-index: 10;
    padding-top: env(safe-area-inset-top, 20px);
    border-bottom: 1px solid var(--border-color);

    .header-content {
      display: flex;
      align-items: center;
      height: 44px;
      padding: 0 16px;
      position: relative;

      .back-btn {
        cursor: pointer;
        padding: 4px;
        margin-left: -4px;
      }

      .page-title {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .tabs-container {
    display: flex;
    padding: 12px 16px;
    gap: 24px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      font-size: 16px;
      color: var(--text-dark-gray);
      white-space: nowrap;
      cursor: pointer;
      position: relative;
      padding: 4px 0;

      &.active {
        color: var(--bg-opposite);
        font-weight: 600;
      }
    }
  }

  /* 如果把 tabs 放在 header 之外（组件顶部），使用此类保证顶部间距 */
  .top-tabs {
    position: sticky;
    top: 50px;
    /* 紧贴 header 底部 */
    background: var(--bg-page-h5);
    z-index: 9;
    border-bottom: 1px solid var(--border-color);
  }

  .messages-list {
    padding: 8px 0;

    .date-separator {
      display: flex;
      justify-content: center;
      margin: 24px 0;

      span {
        background: var(--bg-page);
        color: var(--text-dark-gray);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
      }
    }

    .message-item {
      display: flex;
      padding: 16px;
      gap: 12px;
      transition: background 0.2s;

      &:active {
        background: var(--bg-page);
      }

      .message-icon-wrapper {
        flex-shrink: 0;

        .icon-circle {
          width: 40px;
          height: 40px;
          background: var(--bg-page);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dark-gray);
        }
      }

      .message-content {
        flex: 1;
        min-width: 0;

        .message-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;

          .message-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
            color: var(--bg-opposite);
          }

          .message-meta {
            display: flex;
            align-items: center;
            gap: 6px;

            .message-time {
              font-size: 12px;
              color: var(--text-dark-gray);
            }

            .unread-dot {
              width: 6px;
              height: 6px;
              background: #32d74b; // 绿色未读点
              border-radius: 50%;
            }
          }
        }

        .message-desc {
          font-size: 14px;
          color: var(--text-dark-gray);
          line-height: 1.4;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }

  .empty {
    text-align: center;
    color: var(--text-dark-gray);
    padding: 40px 0;
  }
}
</style>
