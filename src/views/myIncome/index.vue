<template>
    <div class="myIncome">
        <div class="header">
            <div class="goback" @click="goBack">
                <el-icon class="goback-icon">
                    <ArrowLeft />
                </el-icon>
            </div>

            <div class="title">我的LP收益</div>

            <div class="right">
                <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? '开灯' : '关灯'">
                    <el-icon class="theme-icon">
                        <Sunny v-if="isDark" />
                        <Moon v-else />
                    </el-icon>
                </button>
            </div>
        </div>


        <div class="income">
            <h3>我的LP收益</h3>

            <div class="box">
                <div class="item">
                    <b>我的收益(CMT)</b>
                    <p>200,000</p>
                </div>
                <div class="item">
                    <b>算力收益(CMT)</b>
                    <p>1000</p>
                </div>
                <div class="item">
                    <b>网络收益(CMT)</b>
                    <p>100000</p>
                </div>
            </div>

            <h3 style="margin-bottom: 16px;">待领取收益</h3>

            <div class="processDiv">
                <el-progress :text-inside="true" :stroke-width="20" color="#1CCE57" :percentage="80" />
                <div class="text">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>
            <ul>
                <li>
                    <span>静态收益：100 CMT</span>
                    <button>claim</button>
                </li>
                <li>
                    <span>直推收益：100.00 CMT</span>
                    <button>claim</button>
                </li>
                <li>
                    <span> 间推收益：100 CBN</span>
                    <button>claim</button>
                </li>
                <li>
                    <span>二级市场盈利收益：1000 CMT</span>
                    <button>claim</button>
                </li>
                <li>
                    <span>创世节点5%收益：1000 CMT</span>
                    <button>claim</button>
                </li>

            </ul>

            <h4>
                <span>节点购买记录</span>
                <b>
                    查看更多
                    <el-icon class="arrow-icon">
                        <ArrowRightBold />
                    </el-icon>
                </b>
            </h4>
            <div class="tableContent">
                <table>
                    <thead>
                        <tr>
                            <th>操作时间</th>
                            <th>产品类型</th>
                            <th>消耗USDT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2025-09-01  09:08:36</td>
                            <td>分布节点</td>
                            <td>500</td>
                        </tr>
                        <tr>
                            <td>2025-09-01  09:08:36</td>
                            <td>分布节点</td>
                            <td>500</td>
                        </tr>
                        <tr>
                            <td>2025-09-01  09:08:36</td>
                            <td>分布节点</td>
                            <td>500</td>
                        </tr>
                        <tr>
                            <td>2025-09-01  09:08:36</td>
                            <td>分布节点</td>
                            <td>500</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


        <div class="content">
            <div class="tab">
                <div v-for="(item, index) in tabArr" :class="item.index == active ? 'active' : 'item'"
                    @click="tab(item.index)">{{ item.name }}</div>
            </div>
            <div class="myLevel">
                <div>
                    <span>我的上级：</span>
                    <b>289KS8283268</b>
                </div>

                <div>
                    <span>邀请总人数：</span>
                    <b>3</b>
                </div>

            </div>

            <div class="tree"></div>

            <div class="tableContent">
                <table>
                    <thead>
                        <tr>
                            <th>间推用户</th>
                            <th>上级</th>
                            <th>质押类型</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>87152721AH17</td>
                            <td>921GS91GHSd</td>
                            <td>T1</td>
                        </tr>
                        <tr>
                            <td>87152721AH17</td>
                            <td>921GS91GHSd</td>
                            <td>T1</td>
                        </tr>
                        <tr>
                            <td>87152721AH17</td>
                            <td>921GS91GHSd</td>
                            <td>T1</td>
                        </tr>
                        <tr>
                            <td>87152721AH17</td>
                            <td>921GS91GHSd</td>
                            <td>T1</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue"
import { ArrowLeft, ArrowRightBold, Sunny, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'

const router = useRouter()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
    themeStore.toggleTheme()
}

const goBack = () => {
    router.back()
}

const tabArr = ref([
    {
        name: "直推",
        index: 0
    },
    {
        name: "网体",
        index: 1
    }
])

function tab(index) {
    active.value = index
}

const active = ref(1)

// 初始化主题
onMounted(() => {
    themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.myIncome {
    min-height: 100vh;
    padding: 20px 10px 0 10px;
    background-color: var(--bg-page, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;

    .header {
        position: relative;
        height: 22px;
        display: flex;
        margin-bottom: 35px;
        align-items: center;
        justify-content: space-between;

        .goback {
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: transform 0.2s ease;

            &:hover {
                transform: translateX(-2px);
            }

            &:active {
                transform: translateX(-4px);
            }

            .goback-icon {
                color: var(--text-color, #000000);
                font-size: 20px;
                transition: color 0.3s ease;
            }
        }

        .title {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-weight: 600;
            font-size: 16px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
        }

        .right {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .theme-toggle-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-light, #F5F5F5);
            border: 1px solid var(--border-color, #E0E0E0);
            border-radius: 8px;
            color: var(--text-color, #000000);
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;

            &:hover {
                background-color: var(--bg-card, #ffffff);
                border-color: var(--text-color, #000000);
                transform: scale(1.05);
            }

            &:active {
                transform: scale(0.95);
            }

            .theme-icon {
                font-size: 18px;
                transition: transform 0.3s ease, color 0.3s ease;
                color: var(--text-color, #000000);
            }

            &:hover .theme-icon {
                transform: rotate(15deg);
            }
        }
    }

    .banner {
        margin-bottom: 40px;

        h3 {
            font-weight: bold;
            font-size: 20px;
            color: #000000;
            margin-bottom: 20px;

        }

        img {
            width: 100%;
        }
    }

    .income {
        margin-bottom: 38px;

        h3 {
            font-size: 20px;
            color: var(--text-color, #000000);
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .tableContent {
            table {
                width: 100%;
                border: 1px solid var(--border-color, #F3F3F3);
                background: var(--bg-card, #ffffff);
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.3s ease;

                thead {
                    tr {
                        th {
                            font-weight: 400;
                            font-size: 14px;
                            color: var(--text-gray, #909090);
                            height: 50px;
                            border-bottom: 1px solid var(--border-color, #F3F3F3);
                            background: var(--bg-light, #F5F5F5);
                            transition: all 0.3s ease;
                        }
                    }
                }

                tbody {
                    tr {
                        transition: background-color 0.2s ease;

                        &:hover {
                            background-color: var(--bg-light, #F5F5F5);
                        }

                        td {
                            height: 60px;
                            font-weight: 400;
                            font-size: 14px;
                            color: var(--text-color, #000000);
                            border-right: 1px solid var(--border-color, #F3F3F3);
                            border-bottom: 1px solid var(--border-color, #F3F3F3);
                            transition: all 0.3s ease;
                        }
                    }
                }
            }
        }

        h4 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 46px 0 23px 0;

            span {
                font-size: 20px;
                color: var(--text-color, #000000);
                font-weight: 600;
                transition: color 0.3s ease;
            }

            b {
                font-weight: 400;
                font-size: 14px;
                color: var(--text-color, #000000);
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    color: var(--text-color, #000000);
                    transform: translateX(4px);
                }

                .arrow-icon {
                    color: var(--text-color, #000000);
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                &:hover .arrow-icon {
                    transform: translateX(2px);
                }
            }
        }

        .processDiv {
            .text {
                margin-top: 4px;
                display: flex;
                justify-content: space-between;
                align-content: center;
                font-weight: 600;
                font-size: 12px;
                color: var(--text-gray, #909090);
                transition: color 0.3s ease;
            }
        }

        .box {
            margin-top: 14px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 40px;

            .item {
                height: 80px;
                background: var(--bg-light, #F4F4F4);
                flex: 1;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: background-color 0.3s ease, transform 0.2s ease;

                &:hover {
                    transform: translateY(-2px);
                }

                b {
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-dark-gray, #999999);
                    line-height: 22px;
                    transition: color 0.3s ease;
                }

                p {
                    font-weight: bold;
                    font-size: 24px;
                    color: var(--text-color, #000);
                    line-height: 20px;
                    transition: color 0.3s ease;
                }
            }
        }

        ul {
            margin-top: 13px;
            list-style: none;

            li {
                height: 60px;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                display: flex;
                border-radius: 8px;
                border: 1px solid var(--border-color, #F3F3F3);
                margin-bottom: 10px;
                background: var(--bg-card, #ffffff);
                transition: all 0.3s ease;

                &:hover {
                    border-color: var(--text-color, #000000);
                    transform: translateX(4px);
                }

                span {
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--text-color, #000000);
                    transition: color 0.3s ease;
                }

                button {
                    width: 64px;
                    height: 28px;
                    background: #C1272E;
                    border-radius: 24px;
                    outline: none;
                    border: 1px solid #C1272E;
                    font-weight: 400;
                    font-size: 14px;
                    color: #FFFFFF;
                    cursor: pointer;
                    transition: all 0.2s ease;

                    &:hover {
                        background: #a01f25;
                        transform: scale(1.05);
                    }

                    &:active {
                        transform: scale(0.95);
                    }
                }
            }
        }
    }

    .content {
        .tab {
            display: flex;
            gap: 32px;
            border-bottom: 1px solid var(--border-color, #F3F3F3);
            margin-bottom: 20px;
            overflow-x: auto;
            white-space: nowrap;
            transition: border-color 0.3s ease;

            .item {
                flex-shrink: 0;
                font-weight: 400;
                font-size: 16px;
                width: 32px;
                color: var(--text-gray, #909090);
                padding-bottom: 15px;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    color: var(--text-color, #000000);
                }
            }

            .active {
                flex-shrink: 0;
                font-weight: 400;
                font-size: 16px;
                color: var(--text-color, #000);
                width: 32px;
                padding-bottom: 15px;
                border-bottom: 2px solid var(--text-color, #000);
                transition: all 0.3s ease;
            }
        }

        .myLevel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 50px;
            margin-bottom: 16px;
            background: var(--bg-light, #F4F4F4);
            border-radius: 8px;
            padding: 0 10px;
            font-weight: 600;
            font-size: 14px;
            transition: background-color 0.3s ease;

            span {
                color: var(--text-gray, #909090);
                transition: color 0.3s ease;
            }

            b {
                color: var(--text-color, #000);
                transition: color 0.3s ease;
            }
        }

        .tree {
            height: 354px;
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-card, #000);
            transition: background-color 0.3s ease;
        }

        .tableContent {
            table {
                width: 100%;
                border: 1px solid var(--border-color, #F3F3F3);
                background: var(--bg-card, #ffffff);
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.3s ease;

                thead {
                    tr {
                        th {
                            font-weight: 400;
                            font-size: 14px;
                            color: var(--text-gray, #909090);
                            height: 50px;
                            border-bottom: 1px solid var(--border-color, #F3F3F3);
                            background: var(--bg-light, #F5F5F5);
                            transition: all 0.3s ease;
                        }
                    }
                }

                tbody {
                    tr {
                        transition: background-color 0.2s ease;

                        &:hover {
                            background-color: var(--bg-light, #F5F5F5);
                        }

                        td {
                            height: 60px;
                            font-weight: 400;
                            font-size: 14px;
                            color: var(--text-color, #000000);
                            border-right: 1px solid var(--border-color, #F3F3F3);
                            border-bottom: 1px solid var(--border-color, #F3F3F3);
                            transition: all 0.3s ease;
                        }
                    }
                }
            }
        }
    }




}</style>