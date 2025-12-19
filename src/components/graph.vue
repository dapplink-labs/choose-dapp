<template>
    <div class="graph-container">
      <div ref="chartRef" class="chart-instance"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  
  const chartRef = ref(null);
  let myChart = null;
  
  // --- 1. 模拟数据 ---
  const generateGraphData = () => {
    const nodes = [];
    const links = [];
  
    // Root
    nodes.push({
      id: 'root',
      name: 'Root',
      category: 'core',
      symbolSize: 70,
      x: 100, y: 100, // 故意放坐标以便测试边缘
      // fixed: true, 
      dataInfo: {
        address: '0x58...78sg',
        tag: '“1200U”-分布节点',
        cmt: '99.99USDT + 10.00 MEME',
        sub: '50.00USDT + 5.00 MEME',
        time: '2025-09-01 23:12'
      }
    });
  
    // Layer 1
    for (let i = 0; i < 5; i++) {
      const id = `l1-${i}`;
      nodes.push({
        id: id,
        name: `Sub-${i}`,
        category: 'layer1',
        symbolSize: 45,
        dataInfo: {
          address: `0x${i}A...B${i}`,
          tag: '核心成员',
          cmt: '45.00USDT',
          sub: '12.00USDT',
          time: '2025-09-02'
        }
      });
      links.push({ source: 'root', target: id });
    }
  
    // Leafs
    for (let i = 0; i < 20; i++) {
      const pid = Math.floor(Math.random() * 5);
      nodes.push({
        id: `leaf-${i}`,
        category: Math.random() > 0.5 ? 'leaf-red' : 'leaf-blue',
        symbolSize: 10,
        dataInfo: {
          address: `0x...${i}`,
          tag: '节点',
          cmt: '10U',
          sub: '0U',
          time: '2025-09-03'
        }
      });
      links.push({ source: `l1-${pid}`, target: `leaf-${i}` });
    }
  
    return { nodes, links };
  };
  
  // --- 2. 初始化 ---
  const initChart = () => {
    if (!chartRef.value) return;
  
    myChart = echarts.init(chartRef.value);
    const { nodes, links } = generateGraphData();
  
    const option = {
      backgroundColor: '#050508',
      
      // --- 核心修改：Tooltip 配置 ---
      tooltip: {
        trigger: 'item',
        confine: true,  // <--- 【重点】强制限制在容器内
        enterable: true,
        padding: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
        extraCssText: 'box-shadow: none;',
        // 智能定位：根据鼠标位置决定显示在左/右/上/下
        position: function (point, params, dom, rect, size) {
           // 获取鼠标坐标
           var x = point[0];
           var y = point[1];
           // 获取容器宽高
           var viewWidth = size.viewSize[0];
           var viewHeight = size.viewSize[1];
           // 获取弹窗宽高
           var boxWidth = size.contentSize[0];
           var boxHeight = size.contentSize[1];
           
           var posX = 0;
           var posY = 0;
           
           // 简单的判断：如果鼠标右侧空间不够，就放左边
           if (x + boxWidth + 20 > viewWidth) {
               posX = x - boxWidth - 10;
           } else {
               posX = x + 10;
           }
           
           // 如果鼠标下方空间不够，就放上边
           if (y + boxHeight + 20 > viewHeight) {
               posY = y - boxHeight - 10;
           } else {
               posY = y + 10;
           }
           
           return [posX, posY];
        },
        formatter: (params) => {
          if (params.dataType !== 'node') return;
          const info = params.data.dataInfo;
          return `
            <div class="custom-tooltip-card">
              <div class="tooltip-header">
                <span class="addr">${info.address}</span>
                <span class="sep">-</span>
                <span class="tag">${info.tag}</span>
              </div>
              <div class="tooltip-body">
                <div class="row">
                  <span class="label">CMT收益:</span>
                  <span class="value">${info.cmt}</span>
                </div>
                <div class="row">
                  <span class="label">子币收益:</span>
                  <span class="value">${info.sub}</span>
                </div>
                <div class="row">
                  <span class="label">购买时间</span>
                  <span class="value time">${info.time}</span>
                </div>
              </div>
            </div>
          `;
        }
      },
  
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          label: { show: false },
          force: {
            repulsion: 350,
            gravity: 0.1,
            edgeLength: [50, 150]
          },
          lineStyle: {
            color: '#ffffff',
            opacity: 0.15,
            width: 0.8
          },
          categories: [
            { name: 'core' }, 
            { name: 'layer1' }, 
            { name: 'leaf-red' }, 
            { name: 'leaf-blue' }
          ]
        }
      ]
    };
  
    // 样式配置 (发光效果)
    option.series[0].data = nodes.map(node => {
      let itemStyle = {};
      if (node.category === 'core') {
        itemStyle = {
          color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.5,
            colorStops: [{ offset: 0, color: '#ffea00' }, { offset: 1, color: 'rgba(255,149,0,0.1)' }]
          },
          shadowBlur: 30, shadowColor: 'rgba(255, 174, 0, 0.6)'
        };
      } else if (node.category === 'layer1') {
        itemStyle = {
          color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.5,
            colorStops: [{ offset: 0.2, color: '#3264ff' }, { offset: 1, color: 'rgba(20,40,120,0.2)' }]
          },
          shadowBlur: 20, shadowColor: '#3c78ff',
          borderColor: '#64c8ff', borderWidth: 1
        };
      } else {
        const color = node.category === 'leaf-red' ? '#ff3355' : '#00ccff';
        itemStyle = { color, shadowBlur: 8, shadowColor: color };
      }
      return { ...node, itemStyle };
    });
  
    myChart.setOption(option);
  };
  
  const handleResize = () => myChart && myChart.resize();
  
  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (myChart) myChart.dispose();
  });
  </script>
  
  <style scoped lang="scss">
  .graph-container {
    width: 100%;
    height: 100%;
    background: #000;
    position: relative;
    .chart-instance { width: 100%; height: 100%; }
  }
  </style>
  
  <!-- Tooltip 样式 -->
  <style lang="scss">
  .custom-tooltip-card {
    background: rgba(45, 45, 48, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-family: sans-serif;
    color: #fff;
    min-width: 280px;
    pointer-events: none;
  
    .tooltip-header {
      display: flex; align-items: center;
      font-size: 14px; padding-bottom: 8px; margin-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      .addr { color: #ccc; }
      .sep { margin: 0 5px; color: #666; }
      .tag { font-weight: bold; }
    }
  
    .tooltip-body .row {
      display: flex; justify-content: space-between;
      margin-bottom: 5px; font-size: 13px;
      .label { color: #889; }
      .value { font-weight: bold; }
      .time { font-weight: normal; color: #aaa; }
    }
  }
  </style>