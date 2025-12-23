<template>
  <div class="my-promotions-page">
    <!-- 顶部标题 -->
    <div class="top-bar">
      <div class="title">My Promotions</div>
    </div>

    <div class="content">
      <!-- 顶部横向路径列表 -->
      <div class="path-panel">
        <div class="path-header">访问路径</div>
        <div class="path-list">
          <div
            v-for="(node, index) in path"
            :key="node.id"
            class="path-item"
            :class="{ active: node.id === currentNode.id }"
            @click="handleClickPath(index)"
          >
            <div class="path-dot"></div>
            <div class="path-info">
              <div class="path-name">{{ shortAddress(node.address) }}</div>
              <div class="path-amount">Amount: {{ node.amount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方关系图（Canvas，支持双指缩放） -->
      <div
        class="graph-panel"
        @touchstart="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @click="hideCenterInfo"
      >
        <div class="graph-inner" :style="{ transform: `scale(${scale})` }">
          <canvas
            ref="canvasRef"
            class="graph-canvas"
            width="800"
            height="800"
            @click.stop="onCanvasClick"
          ></canvas>

          <div v-if="!children.length" class="no-children-text">
            无直推成员
          </div>

          <!-- 中心节点悬浮信息窗 -->
          <div
            v-if="centerInfoVisible"
            class="center-info-card"
            @click.stop
          >
            <div class="info-title">推广信息</div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ currentNode.address }}</span>
            </div>
            <div class="info-row">
              <span class="label">金额：</span>
              <span class="value">{{ currentNode.amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">直推人数：</span>
              <span class="value">{{ currentNode.children.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'

const CANVAS_SIZE = 800

type PromotionNode = {
  id: string
  address: string
  amount: string
  children: string[]
}

// -------- Mock 数据：树结构，后续可换成接口 --------
const createMockTree = (): Record<string, PromotionNode> => {
  const map: Record<string, PromotionNode> = {}

  // 根节点（我自己）
  map['me'] = {
    id: 'me',
    address: '0xME000000000000000000000000000000000000',
    amount: '1234.56',
    children: [],
  }

  return map
}

const nodeMap: Record<string, PromotionNode> = reactive(createMockTree())
const nodeCounter = ref(0)

// 当前路径（左侧时序列表）
const path = ref<PromotionNode[]>([nodeMap['me']])
const currentNode = computed(() => path.value[path.value.length - 1])

// 中心标签
const centerLabel = computed(() => shortAddress(currentNode.value.address))

// 当前节点的全部直推
const children = computed(() =>
  currentNode.value.children.map((id) => nodeMap[id]).filter(Boolean)
)

// 缩放（双指缩放）
const scale = ref(1.4) // 初始放大，先显示较少数据
const minScale = 0.5
const maxScale = 1.8
const pinchStartDistance = ref<number | null>(null)
const pinchStartScale = ref(1)

const getDistance = (t1: Touch, t2: Touch) => {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    pinchStartDistance.value = getDistance(e.touches[0], e.touches[1])
    pinchStartScale.value = scale.value
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && pinchStartDistance.value) {
    const currentDistance = getDistance(e.touches[0], e.touches[1])
    if (currentDistance <= 0) return
    const ratio = currentDistance / pinchStartDistance.value
    const next = Math.min(maxScale, Math.max(minScale, pinchStartScale.value * ratio))
    scale.value = Number(next.toFixed(2))
  }
}

const onTouchEnd = (e: TouchEvent) => {
  if (e.touches.length < 2) {
    pinchStartDistance.value = null
  }
}

// Canvas 点击命中测试
const onCanvasClick = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY

  const centerX = 200
  const centerY = 200

  const distCenter = Math.hypot(x - centerX, y - centerY)
  if (distCenter <= 22) {
    handleClickCenter()
    return
  }

  const positions = childPositions.value
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    const d = Math.hypot(x - pos.x, y - pos.y)
    if (d <= 14) {
      const child = visibleChildren.value[i]
      if (child) {
        handleClickChild(child)
      }
      return
    }
  }
}

// 根据缩放比例做动态抽样，缩小时展示更多点，放大时只保留较少点便于看清细节
const visibleChildren = computed(() => {
  const list = children.value
  const total = list.length
  if (!total) return []

  const s = scale.value
  // scale 越小，可见范围越大 → 显示更多节点；scale 越大 → 显示更少节点
  let limit = 260
  if (s >= 0.8) limit = 140
  if (s >= 1.1) limit = 80
  if (s >= 1.4) limit = 40

  limit = Math.min(limit, total)
  return list.slice(0, limit)
})

// 将 child id 转为稳定的 0~1 浮点数，用于抖动角度（让布局更自然）
const hashToUnit = (id: string) => {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return (h % 1000) / 1000
}

// 子节点环形随机分布（多圈向外扩展），并为每个点生成曲线控制点
const childPositions = computed(() => {
  const list = visibleChildren.value
  if (!list.length) return []

  const centerX = CANVAS_SIZE / 2
  const centerY = CANVAS_SIZE / 2
  const perRing = 24 // 基础每圈参考数量
  const baseRadius = CANVAS_SIZE * 0.23
  const radiusStep = CANVAS_SIZE * 0.08

  const positions: Array<{ x: number; y: number; ctrlX: number; ctrlY: number }> = []

  let idx = 0
  let ring = 0
  while (idx < list.length) {
    const start = idx
    const end = Math.min(idx + perRing, list.length)
    const count = end - start
    const rBase = baseRadius + ring * radiusStep
    const stepAngle = (2 * Math.PI) / count
    const startAngle = -Math.PI / 2

    for (let i = 0; i < count; i++) {
      const item = list[start + i]
      const jitterUnit = hashToUnit(item.id) - 0.5 // -0.5 ~ 0.5
      const jitter = jitterUnit * stepAngle * 0.4 // 角度抖动（不规则角度）
      const angle = startAngle + i * stepAngle + jitter

      // 半径上再加一层抖动，让环形看起来不那么规则
      const radialJitter = jitterUnit * radiusStep * 0.7 // -0.35~0.35 个 step
      const r = Math.max(baseRadius * 0.6, rBase + radialJitter)

      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      // 曲线控制点：在连线中点基础上沿法线方向偏移，形成弯曲
      const midX = (centerX + x) / 2
      const midY = (centerY + y) / 2
      const normalAngle = angle + Math.PI / 2
      const curveOffset = r * 0.12
      const ctrlX = midX + Math.cos(normalAngle) * curveOffset
      const ctrlY = midY + Math.sin(normalAngle) * curveOffset

      positions.push({ x, y, ctrlX, ctrlY })
    }

    idx = end
    ring++
  }

  return positions
})

// Canvas 绘制
const canvasRef = ref<HTMLCanvasElement | null>(null)

const drawGraph = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2

  ctx.clearRect(0, 0, width, height)

  // 连接线
  const positions = childPositions.value
  if (visibleChildren.value.length && positions.length === visibleChildren.value.length) {
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    visibleChildren.value.forEach((_, idx) => {
      const pos = positions[idx]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      // 使用二次贝塞尔曲线增加弯曲效果
      ctx.quadraticCurveTo(pos.ctrlX, pos.ctrlY, pos.x, pos.y)
      ctx.stroke()
    })
  }

  // 中心节点
  ctx.beginPath()
  ctx.fillStyle = '#3b82f6'
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(centerLabel.value, centerX, centerY + 1)

  // 子节点
  ctx.font = '9px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  visibleChildren.value.forEach((child, idx) => {
    const pos = positions[idx]
    // 点
    ctx.beginPath()
    ctx.fillStyle = '#3b82f6'
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2)
    ctx.fill()

    // 文本
    const label = shortAddress(child.address)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, pos.x + 16, pos.y)
  })
}

// 根据当前点击的人模拟一次“接口请求”，刷新其直推列表
const refreshChildren = (node: PromotionNode, depth = 0) => {
  // 删除旧的子节点（避免 map 无限增长，可按需保留）
  node.children.forEach((childId) => {
    delete nodeMap[childId]
  })
  node.children = []

  // 第二层及以下（我直推的直推及更深处）模拟 200+ 条
  const baseCount = depth >= 1 ? 200 : 0
  const randSpan = depth >= 1 ? 60 : 8 // 200~259，或 0~7
  const count = baseCount + Math.floor(Math.random() * randSpan)
  for (let i = 0; i < count; i++) {
    const id = `N_${++nodeCounter.value}`
    const addrBase = `0x${id}`
    nodeMap[id] = {
      id,
      address: addrBase.padEnd(42, 'x'),
      amount: (Math.random() * 500).toFixed(2),
      children: [],
    }
    node.children.push(id)
  }
}

// 初次进入页面，模拟请求一次“我的直推”并绘制
onMounted(() => {
  refreshChildren(currentNode.value, 0)
  drawGraph()
})

// 当直推列表/可见直推或中心标签、缩放变化时重绘
watch([children, visibleChildren, centerLabel, scale], () => {
  drawGraph()
})

// 中心节点悬浮信息
const centerInfoVisible = ref(false)
const hideCenterInfo = () => {
  centerInfoVisible.value = false
}

// 点击左侧路径
const handleClickPath = (index: number) => {
  path.value = path.value.slice(0, index + 1)
  // 每次点击某个人，相当于重新请求他的直推数据
  const depth = index // root 深度 0，下一层 1 ...
  refreshChildren(currentNode.value, depth)
  // 切换当前查看对象时隐藏信息窗，等待用户再点中心
  hideCenterInfo()
  drawGraph()
}

// 点击中心节点（当前人）
const handleClickCenter = () => {
  centerInfoVisible.value = !centerInfoVisible.value
}

// 点击子节点：加入路径并展示 info
const handleClickChild = (node: PromotionNode) => {
  path.value.push(node)
  // 为新进入的节点模拟一次“请求”
  const depth = path.value.length - 1 // root 深度 0
  refreshChildren(node, depth)
  hideCenterInfo()
  drawGraph()
}

// 工具：地址缩短
function shortAddress(addr: string) {
  if (!addr) return ''
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
</script>

<style scoped lang="scss">
.my-promotions-page {
  width: 100%;
  height: 100vh;
  background: #05050a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 8px 10px 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

/* 顶部路径条 */
.path-panel {
  width: 100%;
  background: #0b0c12;
  border-radius: 10px;
  padding: 6px 8px 6px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.path-header {
  font-size: 12px;
  color: #a0a6b8;
  margin-bottom: 6px;
}

.path-list {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 4px 4px 0;
}

.path-item {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 110px;
  padding: 6px 8px;
  cursor: pointer;

  &.active {
    .path-dot {
      background: #3b82f6;
      border-color: #93c5fd;
    }
    .path-name {
      color: #ffffff;
    }
  }
}

.path-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #4b5563;
  background: #111827;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.path-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}

.path-name {
  font-size: 12px;
  color: #d1d5db;
}

.path-amount {
  font-size: 11px;
  color: #9ca3af;
}

/* 右侧图 */
.graph-panel {
  flex: 1;
  background: #05050a;
  border-radius: 10px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.graph-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transition: transform 0.15s ease;
}

.graph-canvas {
  width: 100%;
  height: 100%;
}

.node-group {
  cursor: pointer;
}

.no-children-text {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #9ca3af;
}

/* 中心节点悬浮信息卡片 */
.center-info-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(10px, -60px);
  width: 210px;
  background: rgba(5, 6, 12, 0.96);
  border-radius: 10px;
  padding: 10px 12px;
  box-sizing: border-box;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.6);
  font-size: 12px;
  z-index: 10;
}

.center-info-card .info-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.center-info-card .info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;
}

.center-info-card .info-row .label {
  min-width: 56px;
  color: #9ca3af;
}

.center-info-card .info-row .value {
  flex: 1;
  word-break: break-all;
}

@media (max-width: 900px) {
  .content {
    gap: 6px;
  }
}
</style>


