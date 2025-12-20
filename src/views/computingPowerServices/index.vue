<template>
  <div class="cps-page">
    <div class="cps-bg"></div>

    <div class="cps-content">
      <div class="cps-card">
        <div class="cps-card-header">
          <div class="back-btn" @click="handleBack">
            <svg t="1766051544466" class="icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="6246" width="32" height="32">
              <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z" p-id="6247"
                fill="currentColor"></path>
            </svg>
          </div>
          <div class="open-btn" @click="handleOpenMore">
            <svg t="1766051224777" class="icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="4731" width="32" height="32">
              <path
                d="M842.724 571.473c0-22.93 18.588-41.518 41.518-41.518s41.518 18.587 41.518 41.518v271.251c0 45.86-37.177 83.036-83.036 83.036H182.126c-45.86 0-83.036-37.177-83.036-83.036V182.126c0-45.86 37.176-83.036 83.036-83.036h271.251c22.93 0 41.518 18.588 41.518 41.518s-18.588 41.518-41.518 41.518H182.126v660.598h660.598V571.473z m2.865-332.009L562.576 521.869c-16.45 16.414-43.119 16.414-59.57 0-16.448-16.414-16.448-43.027 0-59.441l283.95-283.339H646.05c-22.138 0-40.084-17.907-40.084-40 0-22.09 17.946-39.998 40.084-39.998h203.56c42.056-0.001 76.149 34.019 76.149 75.985v203.122c0 22.092-17.947 40-40.086 40s-40.085-17.908-40.085-40V239.464z"
                fill="currentColor" p-id="4732">
              </path>
            </svg>
          </div>
        </div>

        <h1 class="cps-title">算力服务商</h1>

        <p class="cps-desc">
          1、分布式节点算力服务商 500U，享受数据节点收益、交易全网手续费买卖 0.5% 收益，子币手续费 3%。二级市场分润 10%
          收益，分布式算力节点推分布式算力节点。
          <a href="javascript:void(0)" class="cps-link" @click="handleOpenMore">了解更多</a>
        </p>

        <!-- 购买节点标题区域 -->
        <div class="node-header">
          <div class="node-title-wrap">
            <h2 class="node-section-title">购买节点</h2>
          </div>
          <div class="my-node-btn" @click="handleMyNodes">
            我的节点 <svg t="1766063981785" class="icon-next" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="1589" width="12" height="12">
              <path
                d="M340.688 830.24l11.312 11.328a16 16 0 0 0 22.624 0L685.76 530.448a16 16 0 0 0 0-22.64L374.624 196.688a16 16 0 0 0-22.624 0l-11.312 11.312a16 16 0 0 0 0 22.624l288.496 288.496-288.496 288.512a16 16 0 0 0 0 22.624z"
                fill="currentColor" p-id="1590"></path>
            </svg>
          </div>
        </div>

        <!-- 购买节点模块 -->
        <div class="node-card">
          <div class="node-tabs">
            <div class="node-tab" :class="{ active: activeNodeTab === 'distributed' }"
              @click="activeNodeTab = 'distributed'">
              分布节点
            </div>
            <div class="node-tab" :class="{ active: activeNodeTab === 'cluster' }" @click="activeNodeTab = 'cluster'">
              集群节点
            </div>
          </div>

          <div class="node-content">
            <div class="node-image-wrap">
              <img :src="currentNodeImg" alt="节点插图" class="node-image" />
            </div>

            <ul class="benefit-list">
              <li v-for="(item, idx) in benefits" :key="idx" class="benefit-item">
                <span class="check-icon"></span>
                <span class="text">{{ item }}</span>
              </li>
            </ul>

            <div class="price-row">
              <span class="price-label">价格：</span>
              <span class="price-value">500USDT</span>
            </div>
          </div>

          <div class="buy-btn" @click="handleBuy">
            购买
          </div>
        </div>

        <!-- 节点购买记录模块 -->
        <div class="record-section">
          <div class="record-header">
            <h2 class="record-title">节点购买记录</h2>
            <div class="record-more-btn" @click="handleMoreRecords">
              查看更多 <svg t="1766063981785" class="icon-next" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="1589" width="12" height="12">
                <path
                  d="M340.688 830.24l11.312 11.328a16 16 0 0 0 22.624 0L685.76 530.448a16 16 0 0 0 0-22.64L374.624 196.688a16 16 0 0 0-22.624 0l-11.312 11.312a16 16 0 0 0 0 22.624l288.496 288.496-288.496 288.512a16 16 0 0 0 0 22.624z"
                  fill="currentColor" p-id="1590"></path>
              </svg>
            </div>
          </div>

          <div class="record-card">
            <div class="record-table">
              <div class="record-row record-row--head">
                <div class="cell time">操作时间</div>
                <div class="cell type">产品类型</div>
                <div class="cell amount">消耗USDT</div>
              </div>
              <div v-for="(row, index) in records" :key="index" class="record-row">
                <div class="cell time">{{ row.time }}</div>
                <div class="cell type">{{ row.type }}</div>
                <div class="cell amount">{{ row.amount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <PurchaseNode
      v-model="showPurchaseNode"
      :title="purchaseTitle"
      @buy="handleConfirmBuy"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import cpsBg from '@/assets/icon/cpsBg.png'
import distributedNodeImg from '@/assets/icon/DistributedNode.png'
import clusterNodeImg from '@/assets/icon/ClusterNode.png'
import PurchaseNode from '@/components/PurchaseNode.vue'

const router = useRouter()

// 节点 TAB 状态（目前仅展示 UI，逻辑可后续扩展）
const activeNodeTab = ref('distributed')

const benefits = [
  '享受数据节点收益',
  '交易全网手续费买卖 0.5% 收益',
  '子币手续费 3%',
  '二级市场盈利 10% 收益',
  '分布式算力节点推分布式算力节点'
]

const records = [
  { time: '2025-09-01 09:08:36', type: '分布节点', amount: 500 },
  { time: '2025-09-01 09:08:36', type: '分布节点', amount: 500 },
  { time: '2025-09-01 09:08:36', type: '分布节点', amount: 500 },
  { time: '2025-09-01 09:08:36', type: '分布节点', amount: 500 }
]

const handleBack = () => {
  router.back()
}

const handleOpenMore = () => {
  // 预留「了解更多」跳转逻辑
  console.log('前往了解更多')
}

const handleMyNodes = () => {
  router.push('/myNode')
  console.log('查看我的节点')
}

const showPurchaseNode = ref(false)

const purchaseTitle = computed(() =>
  activeNodeTab.value === 'distributed' ? '分布节点-500 USDT' : '集群节点-10000 USDT'
)

const handleBuy = () => {
  showPurchaseNode.value = true
}

const handleConfirmBuy = () => {
  console.log('确认购买', activeNodeTab.value)
  showPurchaseNode.value = false
}

const handleMoreRecords = () => {
  console.log('查看更多节点购买记录')
}

// 当前展示的节点插图，随 Tab 切换
const currentNodeImg = computed(() =>
  activeNodeTab.value === 'distributed' ? distributedNodeImg : clusterNodeImg
)
</script>

<style scoped lang="scss">
.cps-page {
  width: 100%;
  position: relative;
  background-color: var(--bg-page-h5, #FFFFFF);
  min-height: 100vh;
}

.cps-bg {
  position: fixed;
  top: 0;
  left: 0;
  background: url("@/assets/icon/cpsBg.png") no-repeat;
  background-size: 100% 100%;
  pointer-events: none;
  width: 100%;
  min-height: 230px;
  z-index: 1;
}

.cps-content {
  z-index: 999;
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 16px 32px;
  box-sizing: border-box;
}

.cps-card {
  width: 100%;
  box-sizing: border-box;


}

.node-content {
  width: 100%;
  border: 1px solid var(--border-color, #E0E0E0);
  border-radius: 12px;
  overflow: hidden;

}

.cps-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 29px;
}

.back-btn,
.open-btn {
  width: 24px;
  height: 24px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-color, #000000);
}

.back-btn {
  width: 18px;
  height: 18px;
}

.cps-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color, #111111);
}

.cps-desc {
  line-height: 1.7;
  margin: 0;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: var(--text-dark-gray, #909090);
  text-align: left;
}

.cps-link {
  font-size: 12px;
  color: var(--text-dark-gray, #909090);
  text-decoration: underline;
}

.node-header {
  margin-top: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #000000);
}

.my-node-btn {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-dark-gray, #909090);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.node-card {
  margin-top: 8px;
  background-color: var(--bg-card, #ffffff);
  border-radius: 18px;
  border: 1px solid var(--border-color, #E0E0E0);
  padding: 16px 16px 20px;
  box-sizing: border-box;
}

.node-tabs {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  border-bottom: 1px solid #3B3B3B;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.node-tab {
  font-size: 14px;
  color: var(--text-dark-gray, #999999);
  cursor: pointer;
  padding: 0 0 4px;
  position: relative;
}

.node-tab.active {
  color: var(--text-color, #000000);
  font-weight: 600;
  border-color: var(--text-color, #000000);

  &::after {
    content: '';
    width: 100%;
    height: 2px;
    background-color: var(--text-color, #FFFFFF);
    position: absolute;
    bottom: -9px;
    left: 0;
  }
}

.node-image-wrap {
  width: 100%;
  overflow: hidden;
  margin-bottom: 12px;
}

.node-image {
  width: 100%;
  display: block;
}

.benefit-list {
  list-style: none;
  padding: 0 16px;
  margin: 0 0 24px;
  box-sizing: border-box;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-color, #111111);
  margin-bottom: 16px;

  .text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-color, #000000);
    line-height: 20px;
    text-align: left;
  }
}

.check-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--check-icon-bg, #000000);
  flex-shrink: 0;
  position: relative;
}

.check-icon::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 3px;
  width: 7px;
  height: 4px;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(-45deg);
}

.price-row {
  padding: 0 16px;
  box-sizing: border-box;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-dark-gray, #909090);
  margin-bottom: 31px;
  vertical-align: middle;
}

.price-value {
  font-family: DIN, DIN;
  font-weight: bold;
  font-size: 24px;
  color: #DE9800;
  margin-left: 6px;
  vertical-align: middle;
}

.buy-btn {
  display: block;
  width: calc(100% - 32px);
  margin: 20px auto 23px;
  height: 48px;
  line-height: 48px;
  border-radius: 8px;
  border: none;
  background-color: #c1272e;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #FFFFFF;
  text-align: center;
}

.record-section {
  margin-top: 32px;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.record-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #000000);
}

.record-more-btn {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-dark-gray, #909090);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.record-card {
  background-color: var(--bg-card, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #E0E0E0);
  overflow: hidden;
}

.record-table {
  width: 100%;
}

.record-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text-color, #333333);
}

.cell {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-color, #000000);
}

.record-row--head>.cell {
  font-weight: 500;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #909090;
}

.record-row:not(.record-row--head) {
  border-top: 1px solid var(--border-color, #E0E0E0);
}

.cell {
  padding: 10px 0;
  box-sizing: border-box;
  text-align: center;
}

.cell.time {
  flex: 1.2;
}

.cell.type {
  flex: 0.8;
  border-left: 1px solid var(--border-color, #E0E0E0);
  border-right: 1px solid var(--border-color, #E0E0E0);
}

.record-row--head>.cell.type {
  border: none;
}

.cell.amount {
  flex: 0.8;
  text-align: center;
}
</style>