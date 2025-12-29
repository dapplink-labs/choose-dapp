<template>
  <div class="breaking-page">

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 导航栏 -->
      <NavBar2 />
      
      <div class="content-wrapper">

        <!-- 左右布局 -->
        <div class="page-layout">
          <!-- 左侧部分 -->
          <div class="left-section">
            <!-- 广告图片 -->
            <div class="ad-image-top">
              <img src="https://picsum.photos/seed/ad1/800/200" :alt="$t('breaking.ad')" />
            </div>

            <!-- Tab导航 -->
            <div class="tab-navigation">
              <button v-for="tab in tabs" :key="tab.value" :class="['tab-btn', { active: activeTab === tab.value }]"
                @click="handleTabChange(tab.value)">
                {{ tab.label }}
              </button>
            </div>

            <!-- 列表 -->
            <div class="news-list">
              <div v-for="(item, index) in newsList" :key="item.id" class="news-item" @click="handleItemClick(item)">
                <div class="item-number">{{ index + 1 }}</div>
                <img :src="item.avatar" :alt="$t('breaking.avatar')" class="item-avatar" />
                <div class="item-content">
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-stats">
                    <div class="stat-main">{{ item.mainPercent }}%</div>
                    <div class="stat-change" :class="item.changeClass">
                      <el-icon class="change-arrow">
                        <TopRight v-if="item.changeClass === 'positive'" style="color: #4CAF50;" />
                        <BottomRight v-else style="color: #F44336;" />
                      </el-icon>
                      {{ item.changePercent }}%
                    </div>
                  </div>
                </div>

                <div class="item-chart">
                  <canvas :ref="el => setChartRef(el, index)" class="mini-chart"></canvas>
                </div>
                <div class="item-arrow">
                  <svg viewBox="0 0 1024 1024" width="16" height="16">
                    <path d="M716.8 512L409.6 204.8l59.7-59.7L836.3 512 469.3 878.9l-59.7-59.7L716.8 512z"
                      fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧部分 -->
          <div class="right-section">
            <!-- 上半部分：订阅表单 -->
            <div class="subscription-card">
              <div class="card-header">
                <svg t="1765595445080" class="icon bell-icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="7840" width="24" height="24">
                  <path
                    d="M864.10445369 802.99470279c-102.19894784 88.52652487-565.95981085 39.48007197-565.95981084 39.4800731s-153.64778439-11.74476117-153.31691748-103.08879587c0.23427869-64.55405909 87.97165454-69.47391147 99.4924123-123.95604196 8.21825081-38.86149405 8.48130048-146.03372658 40.77477092-238.12786289 28.91492466-82.45993927 145.97001899-181.76328477 220.03291591-193.44433835 86.3132069-13.61488099 195.93303609 99.85821582 231.18787129 179.81301646 18.61282702 42.21126883 26.03781803 196.51256775 30.93300906 234.35679858 5.52815502 42.75586389 86.53104583 87.91411143 105.35965582 120.15826033 17.45170887 29.88492003 21.17550649 59.09988579-8.50390698 84.8088906zM595.18127104 915.53479566c0 39.63420331-32.13111865 71.76532195-71.76532195 71.76532196s-71.76326713-32.13111865-71.76326714-71.76532196 32.12906382-30.98849621 71.76326714-30.98849735 71.76532195-8.64570595 71.76532195 30.98849735zM579.68599495 127.64523293c0 28.31484245-25.19318073 24.60953941-56.27004586 24.60953941s-56.27004587 3.70530304-56.27004587-24.60953941c0-28.31278763 25.19318073-51.26593536 56.27004587-51.26593536s56.27004587 22.95109291 56.27004586 51.26593536zM299.34480725 254.6859429c-29.00740323 33.92725561-44.67119445 66.87629539-49.72051683 62.56268971-5.04726755-4.31566051 2.44143104-44.26018019 31.44472348-78.18743467 29.00534727-33.92725561 67.11262891-46.43856043 72.15784164-42.12290105 5.04932238 4.31360569-24.87669987 23.81833557-53.88204829 57.74764601zM724.81343261 255.75869326c-22.64899698-38.46280875-48.71353003-63.99302315-42.99219741-67.36540331 5.72133262-3.36827051 41.05837113 16.70366094 63.70942293 55.16441487 22.64899698 38.46280875 22.08796103 78.56762425 16.36662841 81.93589475-5.72133262 3.37032533-14.43280099-31.27209757-37.08385393-69.73490631z"
                    p-id="7841" fill="#909090"></path>
                </svg>
                <h3 class="card-title">{{ $t('breaking.subscription.title') }}</h3>
              </div>
              <p class="card-description">{{ $t('breaking.subscription.description') }}</p>
              <div class="card-form">
                <input v-model="email" type="email" :placeholder="$t('breaking.subscription.emailPlaceholder')" class="email-input" />
                <button class="submit-btn" @click="handleSubscribe">{{ $t('breaking.subscription.submit') }}</button>
              </div>
            </div>

            <!-- 下半部分：Live on ChooseMe -->
            <div class="live-section">
              <div class="live-header">
                <h3 class="live-title">{{ $t('breaking.live.title') }}</h3>
                <button class="follow-btn">{{ $t('breaking.live.followBtn') }}</button>
              </div>
              <div class="breaking-news-list">
                <div v-for="(news, index) in breakingNews" :key="index" class="breaking-news-item">
                  <div class="news-label">{{ $t('breaking.live.breakingNews') }}</div>
                  <div class="news-time">{{ news.time }}</div>
                  <div class="news-content">{{ news.content }}</div>
                </div>
              </div>
              <div class="ad-image-bottom">
                <img src="https://picsum.photos/seed/chart/400/300" :alt="$t('breaking.chartAd')" />
              </div>
              <button class="view-all-btn" @click="handleViewAll">{{ $t('breaking.live.viewAll') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 绑定邮箱弹层（从底部升起） -->
    <BindEmail v-model="showBindEmail" v-model:email="bindEmail" @get-code="handleGetCode" @confirm="handleBindConfirm"
      @skip="handleBindSkip" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavBar2 from '@/components/navBar2.vue'
import BindEmail from '@/components/BindEmail.vue'
import { TopRight, BottomRight } from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

// Tab导航
const tabs = computed(() => [
  { label: t('breaking.tabs.all'), value: 'all' },
  { label: t('breaking.tabs.politics'), value: 'politics' },
  { label: t('breaking.tabs.crypto'), value: 'crypto' },
  { label: t('breaking.tabs.finance'), value: 'finance' }
])

const activeTab = ref('all')

const handleTabChange = (value) => {
  activeTab.value = value
}


// 新闻列表数据
const newsList = ref([
  {
    id: 1,
    avatar: 'https://picsum.photos/seed/user1/40/40',
    title: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    mainPercent: 100,
    changePercent: 28,
    changeArrow: '↓',
    changeClass: 'negative',
    chartData: [85, 80, 75, 82, 88, 90, 95, 92, 98, 100]
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/seed/user2/40/40',
    title: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    mainPercent: 88,
    changePercent: 15,
    changeArrow: '↑',
    changeClass: 'positive',
    chartData: [70, 72, 75, 78, 80, 82, 85, 88, 86, 88]
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/seed/user3/40/40',
    title: '特斯拉2025年第三季度财报预测',
    mainPercent: 75,
    changePercent: 12,
    changeArrow: '↑',
    changeClass: 'positive',
    chartData: [60, 62, 65, 68, 70, 72, 75, 73, 74, 75]
  },
  {
    id: 4,
    avatar: 'https://picsum.photos/seed/user4/40/40',
    title: '苹果公司2026年新产品发布预测',
    mainPercent: 65,
    changePercent: 8,
    changeArrow: '↑',
    changeClass: 'positive',
    chartData: [55, 57, 60, 62, 64, 65, 63, 64, 65, 65]
  },
  {
    id: 5,
    avatar: 'https://picsum.photos/seed/user5/40/40',
    title: '比特币价格2025年底预测',
    mainPercent: 58,
    changePercent: 5,
    changeArrow: '↑',
    changeClass: 'positive',
    chartData: [50, 52, 54, 56, 58, 57, 56, 57, 58, 58]
  },
  {
    id: 6,
    avatar: 'https://picsum.photos/seed/user6/40/40',
    title: '以太坊2.0升级完成时间预测',
    mainPercent: 52,
    changePercent: 3,
    changeArrow: '↑',
    changeClass: 'positive',
    chartData: [45, 47, 49, 51, 52, 51, 50, 51, 52, 52]
  }
])

// 图表引用
const chartRefs = ref([])

const setChartRef = (el, index) => {
  if (el) {
    chartRefs.value[index] = el
  }
}

// 绘制迷你图表
const drawMiniChart = (canvas, data, isPositive) => {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.offsetWidth || 80
  const height = canvas.offsetHeight || 30
  canvas.width = width
  canvas.height = height

  ctx.clearRect(0, 0, width, height)

  const padding = 2
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  ctx.strokeStyle = isPositive ? '#4CAF50' : '#F44336'
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((value, index) => {
    const x = padding + (chartWidth / (data.length - 1)) * index
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

// 绘制所有图表
const drawAllCharts = () => {
  nextTick(() => {
    newsList.value.forEach((item, index) => {
      const canvas = chartRefs.value[index]
      if (canvas) {
        drawMiniChart(canvas, item.chartData, item.changeClass === 'positive')
      }
    })
  })
}

// 突发新闻列表
const breakingNews = ref([
  {
    time: '11月26日 16:33',
    content: '自迈克尔·伯里23天前公开表示看空英伟达以来，英伟达股价已下跌17%。'
  },
  {
    time: '11月26日 16:33',
    content: '自迈克尔·伯里23天前公开表示看空英伟达以来，英伟达股价已下跌17%。'
  },
  {
    time: '11月26日 16:33',
    content: '自迈克尔·伯里23天前公开表示看空英伟达以来，英伟达股价已下跌17%。'
  },
  {
    time: '11月26日 16:33',
    content: '自迈克尔·伯里23天前公开表示看空英伟达以来，英伟达股价已下跌17%。'
  },
  {
    time: '11月26日 16:33',
    content: '自迈克尔·伯里23天前公开表示看空英伟达以来，英伟达股价已下跌17%。'
  }
])

// 邮箱输入（右侧表单）
const email = ref('')

// 绑定邮箱弹层控制
const showBindEmail = ref(false)
const bindEmail = ref('')

// 点击「获取更新」按钮，从底部弹出绑定邮箱组件
const handleSubscribe = () => {
  bindEmail.value = email.value
  showBindEmail.value = true
}

// 绑定邮箱组件：获取验证码
const handleGetCode = (val) => {
  console.log('获取邮箱验证码:', val)
  // TODO: 在此调用后端接口发送验证码
}

// 绑定邮箱组件：确认绑定
const handleBindConfirm = (val) => {
  console.log('确认绑定邮箱:', val)
  // TODO: 在此提交绑定邮箱到后端
  showBindEmail.value = false
}

// 绑定邮箱组件：跳过
const handleBindSkip = () => {
  console.log('跳过绑定邮箱')
  showBindEmail.value = false
}

// 查看全部
const handleViewAll = () => {
  console.log('查看全部')
  // 这里可以添加跳转逻辑
}

// 列表项点击
const handleItemClick = (item) => {
  router.push(`/detail?id=${item.id}`)
}

// 组件挂载
onMounted(() => {
  drawAllCharts()
  window.addEventListener('resize', drawAllCharts)
})
</script>

<style scoped lang="scss">
.breaking-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #1a1a1a);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  padding-top: 128px; // header(80px) + navbar2(48px)
  width: 100%;

  .content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 32px 64px;
    box-sizing: border-box;



    // 左右布局
    .page-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;

      // 左侧部分
      .left-section {
        flex: 1;

        // 顶部广告
        .ad-image-top {
          width: 100%;
          margin-bottom: 24px;
          border-radius: 8px;
          overflow: hidden;

          img {
            width: 100%;
            height: auto;
            display: block;
          }
        }

        // Tab导航
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;

          .tab-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 3px;
            background: var(--bg-light, #F3F3F3);
            color: var(--text-color-tabBtn, #18191D);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--bg-light, #F5F5F5);
              color: var(--text-color, #1A1A1A);
            }

            &.active {
              background: var(--text-color, #000000);
              color: var(--bg-color, #FFFFFF);
              font-weight: 500;
            }
          }
        }

        // 新闻列表
        .news-list {
          display: flex;
          flex-direction: column;
          gap: 0;

          .news-item {
            display: flex;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color, #F0F0F0);
            gap: 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;


            &:last-child {
              border-bottom: none;
            }

            .item-number {
              width: 32px;
              text-align: center;
              font-size: 18px;
              font-weight: 600;
              color: var(--text-gray, #999);
              flex-shrink: 0;
            }

            .item-avatar {
              width: 40px;
              height: 40px;
              border-radius: 4px;
              object-fit: cover;
              flex-shrink: 0;
            }

            .item-content {
              flex: 1;
              min-width: 0;

              .item-title {
                font-size: 14px;
                color: var(--text-color, #333);
                line-height: 1.4;
                transition: color 0.3s ease;
              }
            }

            .item-stats {
              display: flex;
              gap: 4px;
              flex-shrink: 0;
              min-width: 80px;

              .stat-main {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color, #000);
                transition: color 0.3s ease;
              }

              .stat-change {
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 2px;

                &.positive {
                  color: #4CAF50;
                }

                &.negative {
                  color: #F44336;
                }

                .change-arrow {
                  font-size: 12px;
                }
              }
            }

            .item-chart {
              width: 80px;
              height: 30px;
              flex-shrink: 0;

              .mini-chart {
                width: 100%;
                height: 100%;
              }
            }

            .item-arrow {
              width: 16px;
              height: 16px;
              color: var(--text-gray, #999);
              flex-shrink: 0;
              transition: color 0.3s ease;

              svg {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }

      // 右侧部分
      .right-section {
        flex: 0 0 380px;
        display: flex;
        flex-direction: column;
        gap: 24px;

        // 订阅卡片
        .subscription-card {
          background: var(--bg-card, #ffffff);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease;

          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;

            .bell-icon {
              color: var(--text-gray, #666);
              transition: color 0.3s ease;
            }

            .card-title {
              font-size: 18px;
              font-weight: 600;
              color: var(--text-color, #000);
              margin: 0;
              transition: color 0.3s ease;
            }
          }

          .card-description {
            font-size: 14px;
            color: var(--text-gray, #666);
            line-height: 1.6;
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }

          .card-form {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .email-input {
              width: 100%;
              padding: 12px;
              box-sizing: border-box;
              border: 1px solid var(--border-color, #E0E0E0);
              border-radius: 6px;
              font-size: 14px;
              outline: none;
              background: var(--bg-card, #ffffff);
              color: var(--text-color, #1a1a1a);
              transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;

              &::placeholder {
                color: var(--text-gray, #999);
              }

              &:focus {
                border-color: var(--text-color, #000);
              }
            }

            .submit-btn {
              width: 100%;
              padding: 12px;
              background: #3B82F6;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s ease;

              &:hover {
                background: #2563eb;
              }
            }
          }
        }

        // Live on ChooseMe
        .live-section {
          background: var(--bg-card, #ffffff);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease;

          .live-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .live-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--text-gray, #999);
              margin: 0;
              transition: color 0.3s ease;
            }

            .follow-btn {
              padding: 6px 12px;
              background: var(--text-color, #1a1a1a);
              color: var(--bg-card, #ffffff);
              border: none;
              border-radius: 6px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
            }
          }

          .breaking-news-list {
            display: flex;
            flex-direction: column;
            gap: 0;
            margin-bottom: 16px;

            .breaking-news-item {
              padding: 12px 0;
              border-bottom: 1px solid var(--border-color, #F0F0F0);
              transition: border-color 0.3s ease;

              &:last-child {
                border-bottom: none;
              }

              .news-label {
                font-size: 12px;
                color: var(--text-gray, #999);
                margin-bottom: 4px;
                transition: color 0.3s ease;
              }

              .news-time {
                font-size: 12px;
                color: var(--text-gray, #999);
                margin-bottom: 8px;
                transition: color 0.3s ease;
              }

              .news-content {
                font-size: 14px;
                color: var(--text-color, #333);
                line-height: 1.5;
                transition: color 0.3s ease;
              }
            }
          }

          .ad-image-bottom {
            width: 100%;
            margin-bottom: 16px;
            border-radius: 8px;
            overflow: hidden;

            img {
              width: 100%;
              height: auto;
              display: block;
            }
          }

          .view-all-btn {
            width: 100%;
            padding: 12px;
            background: transparent;
            color: var(--text-color, #1a1a1a);
            border: 1px solid var(--border-color, #E0E0E0);
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--bg-light, #F5F5F5);
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .main-content {
    .content-wrapper {
      padding: 28px 24px 56px;
    }
  }
}

@media (max-width: 1024px) {
  .main-content {
    .content-wrapper {
      padding: 24px 20px 48px;

      .page-layout {
        flex-direction: column;
        gap: 20px;

        .right-section {
          flex: 1;
          width: 100%;
          gap: 16px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 50px;

    .content-wrapper {
      padding: 16px 16px 40px;

      .page-layout {
        gap: 16px;

        .left-section {
          .tab-navigation {
            overflow-x: auto;
            padding-bottom: 8px;

            .tab-btn {
              flex-shrink: 0;
              font-size: 13px;
              padding: 8px 12px;
            }
          }

          .news-list {
            .news-item {
              align-items: flex-start;
              padding: 12px 0;
              gap: 12px;

              .item-number {
                font-size: 16px;
              }

              .item-avatar {
                width: 36px;
                height: 36px;
              }

              .item-content {
                .item-title {
                  font-size: 13px;
                  line-height: 1.5;
                }
              }

              .item-stats {
                min-width: 70px;

                .stat-main {
                  font-size: 16px;
                }

                .stat-change {
                  font-size: 11px;
                }
              }

              .item-chart {
                width: 68px;
                height: 28px;
              }

              .item-arrow {
                width: 14px;
                height: 14px;
              }
            }
          }
        }

        .right-section {

          .subscription-card,
          .live-section {
            padding: 16px;
          }

          .subscription-card {
            .card-header {
              gap: 6px;

              .card-title {
                font-size: 16px;
              }
            }

            .card-description {
              font-size: 13px;
            }

            .card-form {
              .email-input {
                font-size: 13px;
              }

              .submit-btn {
                font-size: 13px;
              }
            }
          }

          .live-section {
            .live-header {
              .live-title {
                font-size: 14px;
              }

              .follow-btn {
                font-size: 11px;
                padding: 6px 10px;
              }
            }

            .breaking-news-list {
              .breaking-news-item {
                padding: 10px 0;

                .news-label,
                .news-time {
                  font-size: 11px;
                }

                .news-content {
                  font-size: 13px;
                  line-height: 1.4;
                }
              }
            }

            .view-all-btn {
              font-size: 13px;
              padding: 10px 12px;
            }
          }
        }
      }
    }
  }
}
</style>
