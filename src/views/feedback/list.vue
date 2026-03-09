<template>
    <div class="feedback-list">
        <div class="feedback-header">
            <div class="feedback-header-left" @click="router.back()">
                <div class="feedback-header-left-icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="20">
                        <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z"
                            fill="currentColor" />
                    </svg>
                </div>
                <div class="feedback-header-left-text">
                    {{ t("feedback.viewMyFeedbackTitle") }}
                </div>
            </div>
        </div>

        <div class="feedback-tabs">
            <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="changeTab('all')">
                {{ t("feedback.all") }}
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'replied' }" @click="changeTab('replied')">
                {{ t("feedback.replied") }}
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'submitted' }" @click="changeTab('submitted')">
                {{ t("feedback.pendingReply") }}
            </div>
        </div>

        <div class="feedback-content" v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading || finished"
            :infinite-scroll-distance="10">
            <div v-if="list.length === 0 && !loading" class="empty-state">
                <img src="@/assets/images/empty.png" alt="empty" />
                <p>{{ t("feedback.noData") }}</p>
            </div>
            <div v-else class="list-container">
                <div v-for="item in list" :key="item.guid" class="feedback-item">
                    <div class="item-header">
                        <div class="user-info">
                            <img class="avatar" :src="userAvatar" alt="avatar" />
                            <div class="user-details">
                                <span class="address">{{ shortenAddress(item.user_address) }}</span>
                                <span class="time">{{ formatDate(item.created) }}</span>
                            </div>
                        </div>
                        <div class="status-tag" :class="item.reply_status === 'replied' ? 'replied' : 'pending'">
                            {{ item.reply_status === 'replied' ? t("feedback.replied") : t("feedback.submitted") }}
                        </div>
                    </div>

                    <div class="item-type">
                        {{ getFeedbackTypeName(item.feedback_type) }}
                    </div>

                    <div class="item-content">
                        {{ item.content }}
                    </div>

                    <div class="item-images" v-if="item.attachments && item.attachments.length">
                        <img v-for="(img, index) in item.attachments" :key="index" :src="img.image_url"
                            class="feedback-img" @click="previewImage(img.image_url)" />
                    </div>

                    <div class="reply-section" v-if="item.replies && item.replies.length">
                        <div class="reply-header">
                            <img src="@/assets/icon/LP1.png" class="reply-avatar" />
                            <span class="reply-name">{{ t("feedback.adminName") }}</span>
                        </div>
                        <div v-for="(reply, rIndex) in item.replies" :key="rIndex" class="reply-content">
                            {{ reply.content }}
                            <div class="reply-time">{{ formatDate(reply.created) }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="loading" class="loading-more">Loading...</div>
                <div v-if="finished && list.length > 0" class="no-more">No more data</div>
            </div>
        </div>
        <el-image-viewer v-if="showViewer" @close="closeViewer" :url-list="previewUrlList"
            :initial-index="initialIndex" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { getFeedbackListV2, getFeedbackTypesV2 } from "@/api/feedback"
import { useAccount } from '@wagmi/vue'
import dayjs from 'dayjs'

const router = useRouter()
const { t, locale } = useI18n()
const { address } = useAccount()

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(20)
const userAvatar = computed(() => {
    return address.value ? `https://effigy.im/a/${address.value}.svg` : '@/assets/icon/LP1.png'
})

// Feedback types
const feedbackTypes = ref({})

const fetchFeedbackTypes = async () => {
    try {
        const lang = (locale.value || 'zh-cn').toLowerCase()
        const res = await getFeedbackTypesV2({ language_code: lang })
        if (res.data && res.data.success) {
            // Convert array to object for easy lookup: { code: name }
            const types = {}
            if (Array.isArray(res.data.data)) {
                res.data.data.forEach(item => {
                    types[item.code] = item.name
                })
            }
            feedbackTypes.value = types
        }
    } catch (error) {
        console.error('Failed to fetch feedback types:', error)
    }
}

const getFeedbackTypeName = (code) => {
    return feedbackTypes.value[code] || code
}

// Image preview
const showViewer = ref(false)
const previewUrlList = ref([])
const initialIndex = ref(0)

const changeTab = (tab) => {
    if (activeTab.value === tab) return
    activeTab.value = tab
    page.value = 1
    list.value = []
    finished.value = false
    loading.value = false // Reset loading state
    loadMore()
}

const loadMore = async () => {
    if (loading.value || finished.value) return
    loading.value = true

    try {
        const params = {
            address: address.value,
            reply_status: activeTab.value,
            page: page.value,
            page_size: pageSize.value
        }

        const res = await getFeedbackListV2(params)

        if (res.data && res.data.success) {
            const newList = res.data.data.list || []
            if (newList.length < pageSize.value) {
                finished.value = true
            }
            if (page.value === 1) {
                list.value = newList
            } else {
                list.value = list.value.concat(newList)
            }
            page.value++
        } else {
            finished.value = true
        }
    } catch (error) {
        console.error(error)
        finished.value = true
    } finally {
        loading.value = false
    }
}

const shortenAddress = (addr) => {
    if (!addr) return ''
    if (addr.length < 10) return addr
    return addr.slice(0, 6) + '...' + addr.slice(-4)
}

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm')
}

const previewImage = (url) => {
    previewUrlList.value = [url]
    initialIndex.value = 0
    showViewer.value = true
}

const closeViewer = () => {
    showViewer.value = false
}

// Watch address change to reload
watch(address, (newAddr) => {
    if (newAddr) {
        page.value = 1
        list.value = []
        finished.value = false
        loadMore()
    }
})

onMounted(() => {
    fetchFeedbackTypes()
    // Initial load handled by v-infinite-scroll immediate-check (default true)
})
</script>

<style scoped lang="scss">
.feedback-list {
    min-height: 100vh;
    background-color: var(--bg-color-010101);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
}

.feedback-header {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background-color: var(--bg-color-010101);
    position: sticky;
    top: 0;
    z-index: 10;

    .feedback-header-left {
        display: flex;
        align-items: center;
        cursor: pointer;

        .feedback-header-left-icon {
            display: flex;
            align-items: center;
        }

        &-icon svg {}

        &-text {
            margin-left: 12px;
            font-size: 16px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--text-color);
        }
    }
}

.feedback-tabs {
    display: flex;
    padding: 16px;
    gap: 24px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-color-010101);

    .tab-item {
        font-size: 16px;
        color: var(--text-gray);
        cursor: pointer;
        position: relative;
        padding-bottom: 8px;

        &.active {
            color: var(--text-color);
            font-weight: 500;

            &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 2px;
                background-color: var(--text-color);
            }
        }
    }
}

.feedback-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}

.feedback-item {
    margin-bottom: 24px;

    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .user-info {
            display: flex;
            align-items: center;

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 12px;
            }

            .user-details {
                display: flex;
                flex-direction: column;

                .address {
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-color);
                }

                .time {
                    font-size: 12px;
                    color: var(--text-gray);
                    margin-top: 4px;
                }
            }
        }

        .status-tag {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;

            &.replied {
                background-color: rgba(46, 204, 113, 0.2);
                color: #2ecc71;
            }

            &.pending {
                background-color: var(--bg-light);
                color: var(--text-gray);
            }
        }
    }

    .item-type {
        display: inline-block;
        background-color: var(--bg-light);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: var(--text-gray);
        margin-bottom: 12px;
    }

    .item-content {
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-color);
        margin-bottom: 12px;
    }

    .item-images {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;

        .feedback-img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
        }
    }

    .reply-section {
        background-color: var(--bg-card);
        border-radius: 12px;
        padding: 16px;
        margin-top: 12px;
        border: 1px solid var(--border-color);

        .reply-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .reply-avatar {
                width: 24px;
                height: 24px;
                margin-right: 8px;
                border-radius: 50%;
            }

            .reply-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--text-color);
            }
        }

        .reply-content {
            font-size: 14px;
            color: var(--text-gray);
            line-height: 1.5;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }

            .reply-time {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
                text-align: right;
            }
        }
    }
}

.loading-more,
.no-more {
    text-align: center;
    padding: 16px;
    color: var(--text-gray);
    font-size: 14px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100px;

    img {
        width: 120px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    p {
        color: var(--text-gray);
    }
}
</style>
