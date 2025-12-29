<template>
  <div class="team-tree-container">
    <!-- 顶部横向路径列表 -->
    <div class="path-panel">
      <div class="path-header">本人 —> 直推 —> 间推</div>
      <div class="path-list" ref="pathListRef">
        <div
          v-for="(node, index) in path"
          :key="node.id"
          class="path-item"
          :class="{ active: node.id === currentNode.id }"
          @click="handleClickPath(index)"
        >
          <div class="path-avatar-wrap">
            <img src="@/assets/icon/avatar.png" class="path-avatar" alt="avatar" />
          </div>
          <div class="path-info">
            <div class="path-name">{{ shortAddress(node.address) }}</div>
            <div class="path-amount">Amount: {{ node.amount || '0.00' }}</div>
          </div>
          <div v-if="index < path.length - 1" class="path-arrow">/</div>
        </div>
      </div>
    </div>

    <!-- 下方关系图（Canvas，支持双指缩放和拖动） -->
    <div
      class="graph-panel"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @click="hideCenterInfo"
    >
      <div class="graph-inner" :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }" @click="hideCenterInfo">
        <canvas
          ref="canvasRef"
          class="graph-canvas"
          width="1200"
          height="1200"
          @click.stop="onCanvasClick"
        ></canvas>

        <div class="no-children-text" v-if="visibleChildren.length === 0">
          没有更多数据了
        </div>

        <!-- 当前查看节点的信息窗 -->
        <div
          v-if="centerInfoVisible"
          class="center-info-card"
          :style="infoCardStyle"
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
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch, nextTick } from 'vue'

const CANVAS_SIZE = 1200

// 定义节点半径大小
const CHILD_RADIUS = 35 // 子节点放大
const CENTER_RADIUS = 55 // 中心节点比周围更大

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
    amount: '1000.00',
    children: [],
  }

  return map
}

const nodeMap: Record<string, PromotionNode> = reactive(createMockTree())
const nodeCounter = ref(0)

// 当前路径
const path = ref<PromotionNode[]>([nodeMap['me']])
const currentNode = computed(() => path.value[path.value.length - 1])
const pathListRef = ref<HTMLElement | null>(null)

// 中心标签
const centerLabel = computed(() => shortAddress(currentNode.value.address))

// 当前节点的全部直推
const children = computed(() =>
  currentNode.value.children.map((id) => nodeMap[id]).filter(Boolean)
)

// 缩放（双指缩放）
const scale = ref(1.0) // 初始缩放比例
const minScale = 0.15 // 最小缩放比例
const maxScale = 3.0 // 最大缩放比例
const pinchStartDistance = ref<number | null>(null)
const pinchStartScale = ref(1)

const getDistance = (t1: Touch, t2: Touch) => {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// 平移（单指拖动）
const translateX = ref(0)
const translateY = ref(0)
const panStartX = ref<number | null>(null)
const panStartY = ref<number | null>(null)
const panStartTranslateX = ref(0)
const panStartTranslateY = ref(0)
const hasTouchMoved = ref(false) // 用于区分拖动和点击

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // 双指缩放
    pinchStartDistance.value = getDistance(e.touches[0], e.touches[1])
    pinchStartScale.value = scale.value
    // 清除平移状态
    panStartX.value = null
    panStartY.value = null
    hasTouchMoved.value = false
  } else if (e.touches.length === 1) {
    // 单指拖动
    panStartX.value = e.touches[0].clientX
    panStartY.value = e.touches[0].clientY
    panStartTranslateX.value = translateX.value
    panStartTranslateY.value = translateY.value
    hasTouchMoved.value = false
    // 清除缩放状态
    pinchStartDistance.value = null
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && pinchStartDistance.value) {
    // 双指缩放
    const currentDistance = getDistance(e.touches[0], e.touches[1])
    if (currentDistance <= 0) return
    const ratio = currentDistance / pinchStartDistance.value
    const next = Math.min(maxScale, Math.max(minScale, pinchStartScale.value * ratio))
    scale.value = Number(next.toFixed(2))
  } else if (e.touches.length === 1 && panStartX.value !== null && panStartY.value !== null) {
    // 单指拖动
    const deltaX = e.touches[0].clientX - panStartX.value
    const deltaY = e.touches[0].clientY - panStartY.value
    
    // 如果移动距离超过阈值，认为是拖动
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasTouchMoved.value = true
    }
    
    translateX.value = panStartTranslateX.value + deltaX
    translateY.value = panStartTranslateY.value + deltaY
  }
}

const onTouchEnd = (e: TouchEvent) => {
  if (e.touches.length < 2) {
    pinchStartDistance.value = null
  }
  if (e.touches.length === 0) {
    panStartX.value = null
    panStartY.value = null
    // 重置移动标志，延迟一点以确保点击事件能正确判断
    setTimeout(() => {
      hasTouchMoved.value = false
    }, 10)
  }
}

// 鼠标拖动（桌面端）
const isMouseDown = ref(false)
const hasMouseMoved = ref(false) // 用于区分拖动和点击

const onMouseDown = (e: MouseEvent) => {
  if (e.button === 0) { // 左键
    isMouseDown.value = true
    hasMouseMoved.value = false
    panStartX.value = e.clientX
    panStartY.value = e.clientY
    panStartTranslateX.value = translateX.value
    panStartTranslateY.value = translateY.value
    e.preventDefault()
  }
}

const onMouseMove = (e: MouseEvent) => {
  if (isMouseDown.value && panStartX.value !== null && panStartY.value !== null) {
    const deltaX = e.clientX - panStartX.value
    const deltaY = e.clientY - panStartY.value
    
    // 如果移动距离超过阈值，认为是拖动
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMouseMoved.value = true
    }
    
    translateX.value = panStartTranslateX.value + deltaX
    translateY.value = panStartTranslateY.value + deltaY
    e.preventDefault()
  }
}

const onMouseUp = () => {
  isMouseDown.value = false
  panStartX.value = null
  panStartY.value = null
  // 重置移动标志，延迟一点以确保点击事件能正确判断
  setTimeout(() => {
    hasMouseMoved.value = false
  }, 10)
}

// Canvas 点击命中测试
const onCanvasClick = (e: MouseEvent) => {
  // 如果发生了拖动，不处理点击
  if (hasMouseMoved.value || hasTouchMoved.value) {
    return
  }
  
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()

  // 画布在容器中是等比缩放并保持正方形（object-fit: contain + aspect-ratio: 1）
  const size = Math.min(rect.width, rect.height)
  const offsetX = (rect.width - size) / 2
  const offsetY = (rect.height - size) / 2

  // 转换为相对于这个正方形区域的坐标
  const cssX = e.clientX - rect.left - offsetX
  const cssY = e.clientY - rect.top - offsetY

  // 如果点击在正方形外（上下或左右留白区域），直接返回
  if (cssX < 0 || cssY < 0 || cssX > size || cssY > size) {
    return
  }

  // 将正方形中的坐标映射到画布内部坐标（1200x1200）
  const x = (cssX / size) * canvas.width
  const y = (cssY / size) * canvas.height

  // 检测散点图中的节点
  const positions = childPositions.value

  let minDist = Infinity
  let closestIndex = -1

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    const d = Math.hypot(x - pos.x, y - pos.y)
    if (d < minDist) {
      minDist = d
      closestIndex = i
    }
  }

  // 点击判定半径随节点放大同步调整 (CHILD_RADIUS + 10 的容差)
  if (minDist <= CHILD_RADIUS + 10 && closestIndex >= 0) {
    const child = visibleChildren.value[closestIndex]
    if (child) {
      handleClickChild(child)
    }
    return
  }
  
  // 检测中心节点点击（用于弹出信息卡片）
  const distToCenter = Math.hypot(x - CANVAS_SIZE / 2, y - CANVAS_SIZE / 2)
  if (distToCenter <= CENTER_RADIUS + 10) {
      centerInfoVisible.value = !centerInfoVisible.value
  }
}

// 每一级最多展示10条数据
const visibleChildren = computed(() => {
  return children.value.slice(0, 10)
})

// 当前查看节点的信息窗显隐控制
const centerInfoVisible = ref(false)
const hideCenterInfo = () => {
  centerInfoVisible.value = false
}

// 根据缩放程度计算信息弹窗样式
const infoCardStyle = computed(() => {
  const s = scale.value
  // 调整 factor 范围
  const factor = Math.max(0.2, Math.min(0.8, s / 2.5))
  
  const baseWidth = 240
  const basePadding = 16
  const baseFontSize = 14
  const baseTitleFontSize = 16
  const baseBorderRadius = 12
  const baseTranslateX = 20
  const baseTranslateY = -80
  const baseMarginBottom = 10
  const baseRowMarginBottom = 6
  const baseLabelMinWidth = 70
  
  return {
    width: `${baseWidth * factor}px`,
    padding: `${basePadding * factor}px`,
    fontSize: `${baseFontSize * factor}px`,
    borderRadius: `${baseBorderRadius * factor}px`,
    transform: `translate(${baseTranslateX * factor}px, ${baseTranslateY * factor}px)`,
    '--title-font-size': `${baseTitleFontSize * factor}px`,
    '--title-margin-bottom': `${baseMarginBottom * factor}px`,
    '--row-margin-bottom': `${baseRowMarginBottom * factor}px`,
    '--label-min-width': `${baseLabelMinWidth * factor}px`,
  }
})

// 子节点环形分布
const childPositions = computed(() => {
  const list = visibleChildren.value
  if (!list.length) return []

  const centerX = CANVAS_SIZE / 2
  const centerY = CANVAS_SIZE / 2
  const radius = 420 // 稍微拉大环形半径

  return list.map((_, index) => {
    // 均匀分布在圆周上
    const angle = (index / list.length) * Math.PI * 2 - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })
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
  ctx.clearRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2

  ctx.textAlign = 'center'
  
  // 1. 绘制连线
  const positions = childPositions.value
  const hasPoints =
    visibleChildren.value.length && positions.length === visibleChildren.value.length

  if (hasPoints) {
    visibleChildren.value.forEach((item, idx) => {
      const pos = positions[idx]

      // 科技感连线（渐变色）
      const lineGradient = ctx.createLinearGradient(centerX, centerY, pos.x, pos.y)
      lineGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
      lineGradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)')
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const dx = pos.x - centerX
      const dy = pos.y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)
      const cpDist = dist / 2
      const curveAngle = 0.15 
      const cpX = centerX + Math.cos(angle + curveAngle) * cpDist * 1.1
      const cpY = centerY + Math.sin(angle + curveAngle) * cpDist * 1.1
      
      ctx.quadraticCurveTo(cpX, cpY, pos.x, pos.y)
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 3
      ctx.stroke()

      // 线条上的文字 "直推/间推"
      const t = 0.45
      const tx = (1 - t) * (1 - t) * centerX + 2 * (1 - t) * t * cpX + t * t * pos.x
      const ty = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * cpY + t * t * pos.y
      ctx.save()
      ctx.translate(tx, ty)
      ctx.fillStyle = '#6b7280'
      ctx.font = '18px system-ui'
      ctx.textBaseline = 'bottom'
      const relationText = path.value.length === 1 ? '直推' : '间推'
      ctx.fillText(relationText, 0, -10)
      ctx.restore()

      // 2. 绘制子节点（放大并加渐变发光）
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
      
      const nodeGrad = ctx.createRadialGradient(pos.x, pos.y, 5, pos.x, pos.y, CHILD_RADIUS)
      nodeGrad.addColorStop(0, '#60a5fa')
      nodeGrad.addColorStop(1, '#2563eb')
      
      ctx.fillStyle = nodeGrad
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, CHILD_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.shadowBlur = 0 

      // 节点展示：Address + Amount
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px system-ui'
      ctx.textBaseline = 'top'
      ctx.fillText(shortAddress(item.address), pos.x, pos.y + CHILD_RADIUS + 12)
      
      ctx.fillStyle = '#9ca3af'
      ctx.font = '20px system-ui'
      ctx.fillText(`Amount: ${item.amount}`, pos.x, pos.y + CHILD_RADIUS + 40)
    })
  }

  // 3. 绘制中心节点（更大，更强光）
  ctx.shadowBlur = 25
  ctx.shadowColor = 'rgba(59, 130, 246, 0.6)'
  
  const centerGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, CENTER_RADIUS)
  centerGrad.addColorStop(0, '#93c5fd')
  centerGrad.addColorStop(1, '#1d4ed8')
  
  ctx.fillStyle = centerGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, CENTER_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 26px system-ui'
  ctx.textBaseline = 'top'
  ctx.fillText(shortAddress(currentNode.value.address), centerX, centerY + CENTER_RADIUS + 15)
}

// 根据当前点击的人模拟一次"接口请求"，刷新其直推列表
const refreshChildren = (node: PromotionNode, depth = 0) => {
  const oldChildren = [...node.children]
  oldChildren.forEach((childId) => {
    delete nodeMap[childId]
  })
  
  node.children.splice(0, node.children.length)
  
  const baseCount = depth >= 1 ? 200 : 70
  const randSpan = depth >= 1 ? 60 : 51
  const count = baseCount + Math.floor(Math.random() * randSpan)
  
  const newChildren: string[] = []
  for (let i = 0; i < count; i++) {
    const id = `N_${++nodeCounter.value}`
    const addrBase = `0x${id}`
    nodeMap[id] = {
      id,
      address: addrBase.padEnd(42, 'x'),
      amount: (Math.random() * 500).toFixed(2),
      children: [],
    }
    newChildren.push(id)
  }
  
  node.children.push(...newChildren)
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

// 点击左侧路径
const handleClickPath = (index: number) => {
  path.value = path.value.slice(0, index + 1)
  const depth = index
  refreshChildren(currentNode.value, depth)
  hideCenterInfo()
  drawGraph()
}

// 点击子节点：加入路径并展示 info
const handleClickChild = async (node: PromotionNode) => {
  const nodeInMap = nodeMap[node.id]
  if (!nodeInMap) {
    return
  }
  
  path.value.push(nodeInMap)
  
  await nextTick()
  
  if (pathListRef.value) {
    pathListRef.value.scrollTo({
      left: pathListRef.value.scrollWidth,
      behavior: 'smooth'
    })
  }

  const depth = path.value.length - 1
  refreshChildren(nodeInMap, depth)
  
  await nextTick()
  
  hideCenterInfo()
  drawGraph()
}

// 工具：地址缩短
function shortAddress(addr: string) {
  if (!addr) return ''
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
</script>

<style scoped lang="scss">
.team-tree-container {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #0a0b14 0%, #05050a 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 顶部路径条美化 */
.path-panel {
  width: 100%;
  background: rgba(11, 12, 18, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.path-header {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.path-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  &::-webkit-scrollbar { height: 2px; }
  &::-webkit-scrollbar-thumb { background: #334155; }
}

.path-item {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  &.active {
    .path-avatar-wrap {
      border-color: #3b82f6;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    .path-name {
      color: #ffffff;
      font-weight: 600;
    }
  }
}

.path-avatar-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #334155;
  overflow: hidden;
  margin-right: 8px;
  flex-shrink: 0;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #1e293b;
}

.path-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.path-info {
  display: flex;
  flex-direction: column;
}

.path-name {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
}

.path-amount {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

.path-arrow {
  margin: 0 12px;
  color: #334155;
  font-weight: 200;
  flex-shrink: 0;
}

/* 右侧图 */
.graph-panel {
  flex: 1;
  background: transparent;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
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
  object-fit: contain;
  aspect-ratio: 1 / 1;
}

.no-children-text {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #475569;
  pointer-events: none;
}

/* 当前查看节点的信息卡片 */
.center-info-card {
  position: absolute;
  left: 50%;
  top: 50%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 100;
  pointer-events: auto;
}

.center-info-card .info-title {
  color: #3b82f6;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  padding-bottom: 8px;
  margin-bottom: var(--title-margin-bottom);
  font-size: var(--title-font-size, 16px);
  font-weight: bold;
}

.center-info-card .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--row-margin-bottom);
}

.center-info-card .info-row .label {
  min-width: var(--label-min-width, 70px);
  color: #94a3b8;
}

.center-info-card .info-row .value {
  flex: 1;
  word-break: break-all;
  color: #f8fafc;
  text-align: right;
  font-family: monospace;
}
</style>
