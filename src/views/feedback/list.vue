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
            <div 
                class="tab-item" 
                :class="{ active: activeTab === 'all' }"
                @click="activeTab = 'all'"
            >
                {{ t("feedback.all") }}
            </div>
            <div 
                class="tab-item" 
                :class="{ active: activeTab === 'replied' }"
                @click="activeTab = 'replied'"
            >
                {{ t("feedback.replied") }}
            </div>
            <div 
                class="tab-item" 
                :class="{ active: activeTab === 'pending' }"
                @click="activeTab = 'pending'"
            >
                {{ t("feedback.pendingReply") }}
            </div>
        </div>

        <div class="feedback-content">
            <div v-if="loading" class="loading-state">
                Loading...
            </div>
            <div v-else-if="filteredList.length === 0" class="empty-state">
                <img src="@/assets/images/empty.png" alt="empty" />
                <p>{{ t("feedback.noData") }}</p>
            </div>
            <div v-else class="list-container">
                <div v-for="item in filteredList" :key="item.id" class="feedback-item">
                    <div class="item-header">
                        <div class="user-info">
                            <img class="avatar" src="@/assets/icon/LP1.png" alt="avatar" />
                            <div class="user-details">
                                <span class="address">{{ shortenAddress(item.address) }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                        </div>
                        <div class="status-tag" :class="item.status === 'replied' ? 'replied' : 'pending'">
                            {{ item.status === 'replied' ? t("feedback.replied") : t("feedback.submitted") }}
                        </div>
                    </div>
                    
                    <div class="item-type">
                        {{ item.type }}
                    </div>

                    <div class="item-content">
                        {{ item.content }}
                    </div>

                    <div class="item-images" v-if="item.images && item.images.length">
                        <img 
                            v-for="(img, index) in item.images" 
                            :key="index" 
                            :src="img" 
                            class="feedback-img"
                            @click="previewImage(img)"
                        />
                    </div>

                    <div class="reply-section" v-if="item.reply">
                        <div class="reply-header">
                            <img src="@/assets/icon/LP1.png" class="reply-avatar" />
                            <span class="reply-name">{{ t("feedback.adminName") }}</span>
                        </div>
                        <div class="reply-content">
                            {{ item.reply }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { getFeedbackList } from "@/api/feedback"

const router = useRouter()
const { t } = useI18n()

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)

// Mock data for testing if API fails
const mockData = [
    {
        id: 1,
        address: '0xb574...4c7d',
        createTime: '2025-09-01 10:23',
        status: 'replied',
        type: '质押收益',
        content: '我的团队收益一直显示为0，直推收益也是一样，速度帮我查看下，到底是什么原因',
        images: [
            // Add some placeholder images if needed
        ],
        reply: '您好，质押收益采用周期结算机制，并非实时发放。当前产品为 T+1 结算模式，收益将在每日结算后自动发放至您的账户余额，请您耐心等待。如超过结算时间仍未到账，请联系客服进一步核查。'
    },
    {
        id: 2,
        address: '0xb574...4c7d',
        createTime: '2025-09-01 10:23',
        status: 'pending',
        type: '质押收益',
        content: '我的团队收益一直显示为0，直推收益也是一样，速度帮我查看下，到底是什么原因',
        images: []
    }
]

const filteredList = computed(() => {
    if (activeTab.value === 'all') return list.value
    if (activeTab.value === 'replied') return list.value.filter(item => item.status === 'replied')
    if (activeTab.value === 'pending') return list.value.filter(item => item.status !== 'replied')
    return list.value
})

const fetchData = async () => {
    loading.value = true
    try {
        const res = await getFeedbackList()
        if (res.code === 200) {
            list.value = res.data || []
        } else {
            // Fallback to mock for demo
            list.value = mockData
        }
    } catch (error) {
        console.error(error)
        list.value = mockData
    } finally {
        loading.value = false
    }
}

const shortenAddress = (addr) => {
    if (!addr) return ''
    if (addr.length < 10) return addr
    return addr.slice(0, 6) + '...' + addr.slice(-4)
}

const previewImage = (url) => {
    // Implement preview logic
    // Usually open a modal or use a library like el-image-viewer
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.feedback-list {
    min-height: 100vh;
    background-color: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
}

.feedback-header {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background-color: #000;
    position: sticky;
    top: 0;
    z-index: 10;
    
    .feedback-header-left {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        &-icon svg {
            width: 24px;
            height: 24px;
        }
        
        &-text {
            margin-left: 12px;
            font-size: 16px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

.feedback-tabs {
    display: flex;
    padding: 16px;
    gap: 24px;
    border-bottom: 1px solid #333;
    background-color: #000;
    
    .tab-item {
        font-size: 16px;
        color: #999;
        cursor: pointer;
        position: relative;
        padding-bottom: 8px;
        
        &.active {
            color: #fff;
            font-weight: 500;
            
            &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 2px;
                background-color: #fff;
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
                    color: #fff;
                }
                
                .time {
                    font-size: 12px;
                    color: #666;
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
                background-color: rgba(255, 255, 255, 0.1);
                color: #999;
            }
        }
    }
    
    .item-type {
        display: inline-block;
        background-color: #333;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #ccc;
        margin-bottom: 12px;
    }
    
    .item-content {
        font-size: 14px;
        line-height: 1.5;
        color: #ddd;
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
        background-color: #1a1a1a;
        border-radius: 12px;
        padding: 16px;
        margin-top: 12px;
        border: 1px solid #333;
        
        .reply-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .reply-avatar {
                width: 24px;
                height: 24px;
                margin-right: 8px;
            }
            
            .reply-name {
                font-size: 14px;
                font-weight: 500;
                color: #fff;
            }
        }
        
        .reply-content {
            font-size: 14px;
            color: #ccc;
            line-height: 1.5;
        }
    }
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
        color: #666;
    }
}
</style>
