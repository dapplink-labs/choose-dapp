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
          <span class="card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="9.146" height="15.999" viewBox="0 0 9.146 15.999">
              <path fill="currentColor" d="M17.64,14.191,11.586,8.142a1.143,1.143,0,0,1,1.619-1.615l6.858,6.854a1.141,1.141,0,0,1,.033,1.576l-6.887,6.9a1.143,1.143,0,0,1-1.619-1.615Z" transform="translate(-11.251 -6.194)" />
            </svg>
          </span>
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
            <!-- AI 消息：纯文本为单条气泡 -->
            <template v-else-if="msg.role === 'ai'">
              <div v-if="!msg.options" class="msg-row ai">
                <div class="bubble ai-bubble ai-bubble-text">
                  <div class="ai-text">{{ msg.text }}</div>
                </div>
              </div>
              <!-- 带选项时拆成两条独立会话：上块标题 + 下块选项列表（同宽容器保证宽度一致） -->
              <template v-else>
                <div class="ai-message-group">
                  <div class="msg-row ai">
                    <div class="bubble ai-bubble ai-bubble-header">{{ msg.text }}</div>
                  </div>
                  <div class="msg-row ai">
                    <div class="bubble ai-bubble ai-bubble-options">
                      <div v-for="(opt, i) in msg.options" :key="i" class="ai-option-item" @click="sendQuery(opt.text)">
                        <span>{{ opt.text }}</span>
                        <span class="option-arrow">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9.146" height="15.999" viewBox="0 0 9.146 15.999">
                            <path fill="currentColor" d="M17.64,14.191,11.586,8.142a1.143,1.143,0,0,1,1.619-1.615l6.858,6.854a1.141,1.141,0,0,1,.033,1.576l-6.887,6.9a1.143,1.143,0,0,1-1.619-1.615Z" transform="translate(-11.251 -6.194)" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>
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
  { role: 'ai', text: '以下是小 C 为您找到的相关存入教程:' },
  { role: 'user', text: '存入教程' },
  { role: 'ai', text: '以下是小 C 为您找到的相关存入教程:' },
  { role: 'user', text: '存入教程' },
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
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 30px;
  cursor: pointer;

  .card-arrow {
    display: inline-flex;
    align-items: center;
    color: #909090;
  }
  .card-arrow svg {
    display: block;
  }
}

.disclaimer {
  font-size: 13px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 30px;
}

/* 上块+下块同宽：flex 列容器，宽度取两行中较大值，两行拉伸一致 */
.ai-message-group {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 85%;
  width: max-content;
  margin-bottom: 0;
}

.ai-message-group .msg-row {
  margin-bottom: 12px;
  min-width: 0;
}

.ai-message-group .msg-row:last-child {
  margin-bottom: 20px;
}

.ai-message-group .bubble.ai-bubble-header,
.ai-message-group .bubble.ai-bubble-options {
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
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
    color: #fff;
  }

  /* 纯文本 AI 气泡 */
  .ai-bubble-text {
    background: #1a1a1a;
    padding: 0;
  }

  /* 上块：标题会话（单独气泡） */
  .ai-bubble-header {
    background: #2F2F2F;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 15px;
    line-height: 1.5;
  }

  /* 下块：选项列表会话（单独气泡，如图：深底 + 浅灰描边 + 圆角） */
  .ai-bubble-options {
    background: #000;
    padding: 0;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #444;
  }
}

.ai-text {
  padding: 14px 16px;
}

/* 下块：选项列表气泡内的选项项（白字 + 灰箭头 + 项间灰线分隔） */
.ai-bubble-options .ai-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  color: #fff;
  font-size: 15px;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #111;
  }

  .option-arrow {
    display: inline-flex;
    align-items: center;
    color: #909090;
  }
  .option-arrow svg {
    display: block;
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