<template>
  <div class="help-center-page">
    <!-- 顶部导航 -->
    <div class="help-header">
      <div class="header-left">
        <div class="back-btn" @click="handleBack">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="20">
            <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z" fill="currentColor" />
          </svg>
        </div>
        <div class="header-title-wrap">
          <div class="header-logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="22.065" height="22.065" viewBox="0 0 22.065 22.065"
              class="header-logo">
              <g transform="translate(-31 -55.467)">
                <path fill="#ffffff"
                  d="M7.033-2.576,7.033-4A11.025,11.025,0,0,1,18.065,7.033,11.025,11.025,0,0,1,7.033,18.065,11.025,11.025,0,0,1-4,7.033,11.025,11.025,0,0,1,7.033-4Z"
                  transform="translate(35 59.467)" />
                <path fill="#000000"
                  d="M10.84,8.185H4.078A4.093,4.093,0,0,1,0,4.449H1.432A2.677,2.677,0,0,0,4.078,6.762H10.84V8.185ZM1.5,3.381H.046A4.1,4.1,0,0,1,4.078,0H10.84V1.423H4.078A2.678,2.678,0,0,0,1.5,3.381Z"
                  transform="translate(36.354 62.398)" />
              </g>
            </svg>
          </div>
          <span class="header-title">ChooseMe客服</span>
        </div>
      </div>
    </div>

    <div class="help-container" ref="chatListRef">
      <div class="help-content-inner">
        <!-- 问候语 -->
        <h2 class="greeting">您好,需要什么帮助?</h2>

        <!-- 话题快捷按钮 -->
        <div class="topic-buttons">
          <button v-for="topic in topics" :key="topic.key" type="button" class="topic-btn"
            :class="{ active: activeTopic === topic.key }" @click="selectTopic(topic)">
            {{ topic.label }}
          </button>
        </div>

        <!-- AI 推荐卡片 -->
        <div class="ai-recommend-card" @click="sendQuery('如何存入/提币操作流程')">
          <span>如何存入/提币操作流程</span>
          <span class="card-arrow">›</span>
        </div>

        <!-- 免责声明 -->
        <p class="disclaimer">
          ChooseMe智能客服由AI技术提供支持,回复内容可能存在不准确、不完整或时效性问题. 请勿将其当作投资建议.
        </p>

        <!-- 对话列表 -->
        <div class="chat-messages">
          <template v-for="(msg, index) in messages" :key="index">
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="msg-row user">
              <div class="bubble user-bubble">{{ msg.text }}</div>
            </div>
            <!-- AI 消息 -->
            <div v-else class="msg-row ai">
              <div class="bubble ai-bubble">
                <!-- 纯文本回复 -->
                <div v-if="!msg.options" class="ai-text">{{ msg.text }}</div>

                <!-- 带选项列表的回复 -->
                <div v-else class="ai-options-card">
                  <div class="ai-options-header">{{ msg.text }}</div>
                  <div class="ai-options-list">
                    <div v-for="(opt, i) in msg.options" :key="i" class="ai-option-item" @click="sendQuery(opt.text)">
                      <span>{{ opt.text }}</span>
                      <span class="option-arrow">›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 底部输入栏 -->
    <div class="input-bar">
      <div class="input-container">
        <input v-model="inputText" type="text" class="input-field" placeholder="请输入内容"
          @keydown.enter.prevent="sendUserMessage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 逻辑部分保持不变，仅根据需要调整数据结构
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTopic = ref('deposit')
const topics = [
  { key: 'deposit', label: '如何存入和提币' },
  { key: 'login', label: '登录注册问题' },
  { key: 'trade', label: '进行交易' }
]

const messages = ref([
  { role: 'user', text: '如何存入/提币操作流程' },
  {
    role: 'ai',
    text: '小 C 帮您找到了存入/提币流程的相关指南, 请选择类型:',
    options: [{ text: '存入教程' }, { text: '提币教程' }]
  },
  { role: 'user', text: '存入教程' },
  { role: 'ai', text: '以下是小 C 为您找到的相关存入教程:' }
])

const inputText = ref('')
const chatListRef = ref<HTMLElement | null>(null)

const handleBack = () => router.back()
const selectTopic = (topic: any) => activeTopic.value = topic.key

const sendQuery = (text: string) => {
  messages.value.push({ role: 'user', text })
  scrollToBottom()
  // 此处可添加模拟回复逻辑
}

const sendUserMessage = () => {
  if (!inputText.value.trim()) return
  sendQuery(inputText.value)
  inputText.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}
</script>

<style scoped lang="scss">
.help-center-page {
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 顶部导航 */
.help-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .header-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-logo-box {
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .header-logo {
    width: 22.065px;
    height: 22.065px;
    display: block;
  }

  .header-title {
    font-size: 17px;
    font-weight: 600;
  }
}

/* 主内容区 */
.help-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.greeting {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 24px;
  color: var(--bg-opposite);
  margin-bottom: 17px;
}

/* 话题按钮 */
.topic-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.topic-btn {
  padding: 14px 10px;
  border-radius: 8px;
  border: none;
  background: var(--bg-card);
  font-weight: 500;
  font-size: 14px;
  color: var(--bg-opposite);
  white-space: nowrap;
  transition: all 0.2s;

  &.active {
    background: var(--bg-opposite);
    color: var(--bg-page);
  }
}

/* 推荐卡片 */
.ai-recommend-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  border: 1px solid #333;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 30px;
  cursor: pointer;

  .card-arrow {
    font-size: 20px;
    color: #666;
  }
}

.disclaimer {
  font-size: 13px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 30px;
}

/* 聊天气泡区域 */
.msg-row {
  display: flex;
  margin-bottom: 20px;

  &.user {
    justify-content: flex-end;
  }

  .bubble {
    max-width: 85%;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 15px;
    line-height: 1.5;
  }

  .user-bubble {
    background: #333;
    color: #fff;
  }

  .ai-bubble {
    background: #1a1a1a;
    color: #fff;
    padding: 0; // 让选项列表占满气泡
    overflow: hidden;
  }
}

/* AI 特殊选项卡片 */
.ai-text {
  padding: 14px 16px;
}

.ai-options-card {
  .ai-options-header {
    padding: 14px 16px;
    color: #fff;
  }

  .ai-options-list {
    background: #000; // 内部列表深色背景
    border-top: 1px solid #222;
  }

  .ai-option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #222;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #111;
    }

    .option-arrow {
      color: #555;
      font-size: 18px;
    }
  }
}

/* 底部输入框 */
.input-bar {
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: #000;

  .input-container {
    background: #111;
    border-radius: 12px;
    padding: 12px 16px;
  }

  .input-field {
    width: 100%;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    outline: none;

    &::placeholder {
      color: #444;
    }
  }
}
</style>