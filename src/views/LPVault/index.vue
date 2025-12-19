<template>
    <div class="LPVault">
        <div class="header">
            <div class="goback" @click="goBack">
                <el-icon class="goback-icon">
                    <ArrowLeft />
                </el-icon>
            </div>

            <div class="right">
                <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? '开灯' : '关灯'">
                    <el-icon class="theme-icon">
                        <Sunny v-if="isDark" />
                        <Moon v-else />
                    </el-icon>
                </button>
                <img src="@/assets/images/share.svg" alt="" class="share-icon">
            </div>
        </div>

        <div class="intro">
            <h1>LP金库</h1>
            <p>全球⾸创⼀套链上循环进场，循环组LP底池，循环销毁、循环出局、循环应⽤上永动机。每个投资档位按照组LP→销毁底池的循环模式，合约⾃动执⾏
                <a href="">了解更多</a>。
            </p>
        </div>
        <h3>
            <span>质押</span>
            <b @click="handleOpenMyIncome">我的LP收益
                <el-icon class="arrow-icon">
                    <ArrowRightBold />
                </el-icon>
            </b>
        </h3>

        <div class="details">
            <div class="tab hide-scroll">
                <div v-for="(item, index) in tabArr" :class="item.index == active ? 'active' : 'item'"
                    @click="tab(item.index)">{{ item.name }}</div>
            </div>

            <div class="card">
                <div class="imgContiner">
                    <img src="@/assets/images/linghua1.png" alt="">
                </div>

                <div v-if="active == 0">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>200USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>2天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>0.5%-1%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP(50U+50U等值代币)</p>
                        <p>2.第2天:移除流动性，销毁底池(价值100U的代币)</p>
                        <p>注:此时完成⼀次“进-销”循环，获得静态收益.</p>

                    </div>
                </div>
                <div v-if="active == 1">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>600USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>3天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>0.6%-1.1%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP(100U+100U等值代币)</p>
                        <p>2.第2天:销毁底池(价值200U的代币)</p>
                        <p>3.第3天:组LP(100U+100U等值代币)</p>

                    </div>
                </div>

                <div v-if="active == 2">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>1200USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>4天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>0.7%-1.2%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP(150U+150U等值代币)</p>
                        <p>2.第2天:销毁底池(价值300U的代币)</p>
                        <p>3.第3天:组LP(150U+150U等值代币)</p>
                        <p>4.第4天:销毁底池(价值300U的代币)</p>

                    </div>
                </div>

                <div v-if="active == 3">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>2500USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>5天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>0.8%-1.3%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP:250U+250U等值代币)</p>
                        <p>2.第2天:销毁底池(价值500U的代币)</p>
                        <p>3.第3天:组LP(250U+250U等值代币)</p>
                        <p>4.第4天:销毁底池(价值500U的代币)</p>
                        <p>5.第5天：组LP（250U+250U组LP）</p>

                    </div>
                </div>

                <div v-if="active == 4">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>6000USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>6天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>0.9%-1.4%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP(500U+500U等值代币)</p>
                        <p>2.第2天:销毁底池(价值1000U的代币)</p>
                        <p>3.第3天:组LP(500U+500U等值代币)</p>
                        <p>4.第4天:销毁底池(价值1000U的代币)</p>
                        <p>5.第5天：组LP（500U+500U组LP）</p>
                        <p>6.第6天：销毁底池（1000U等值代币</p>
                    </div>
                </div>

                <div v-if="active == 5">

                    <ul>
                        <li>
                            <span>激活金额：</span>
                            <b>14000USDT</b>
                        </li>
                        <li>
                            <span>周期天数：</span>
                            <b>7天</b>
                        </li>
                        <li>
                            <span>日化收益：</span>
                            <b>1%-1.5%</b>
                        </li>
                        <li>
                            <span>总收益：</span>
                            <b>1%周期</b>
                        </li>
                    </ul>

                    <div class="pline">
                        <p>1.第1天:组LP(1000U+1000U等值代币)</p>
                        <p>2.第2天:销毁底池(价值2000U的代币)</p>
                        <p>3.第3天:组LP(1000U+1000U等值代币)</p>
                        <p>4.第4天:销毁底池(价值2000U的代币)</p>
                        <p>5.第5天：组LP（500U+500U组LP）</p>
                        <p>6.第6天：销毁底池（1000U等值代币）</p>
                        <p>7.第7天：组LP（1000U+1000U）</p>
                    </div>
                </div>
                <button>
                    激活算力
                </button>
                <div class="wallect">
                    <div class="item">
                        <img src="@/assets/images/Subtract.png" alt="">
                        <span><b>钱包余额：</b>200000 USDT</span>
                    </div>

                    <div class="item">
                        <img src="@/assets/images/Subtract1.png" alt="">
                        <span><b>LP质押：</b>200 USDT</span>
                    </div>
                </div>
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

const handleOpenMyIncome = () => {
    router.push('/myIncome')
}

const tabArr = ref([
    {
        name: "T1信息节点",
        index: 0
    },
    {
        name: "T2信息节点",
        index: 1
    },
    {
        name: "T3验证节点",
        index: 2
    },
    {
        name: "T4共识节点",
        index: 3
    },
    {
        name: "T5超级节点",
        index: 4
    },
    {
        name: "T6创世节点",
        index: 5
    }
])

function tab(index) {
    active.value = index
}

const active = ref(0)

// 初始化主题
onMounted(() => {
    themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.LPVault {
    min-height: 100vh;
    padding: 20px 10px 60px 10px;
    background-color: var(--bg-page, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;

    .hide-scroll {
        overflow: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .hide-scroll::-webkit-scrollbar {
        display: none;
    }

    .tab {
        display: flex;
        gap: 20px;
        border-bottom: 1px solid var(--border-color, #F3F3F3);
        margin-bottom: 20px;
        overflow-x: auto;
        white-space: nowrap;
        transition: border-color 0.3s ease;

        .item {
            font-weight: 400;
            font-size: 16px;
            width: 90px;
            flex-shrink: 0;
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
            width: 90px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--text-color, #000);
            transition: all 0.3s ease;
        }
    }

    .header {
        position: relative;
        height: 22px;
        display: flex;
        margin-bottom: 13px;
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

        .share-icon {
            width: 16px;
            height: 16px;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;

            &:hover {
                transform: scale(1.1);
                opacity: 0.8;
            }
        }
    }

    .intro {
        h1 {
            font-weight: bold;
            font-size: 28px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
        }

        p,
        a {
            font-weight: 400;
            font-size: 12px;
            color: var(--text-gray, #909090);
            line-height: 18px;
            transition: color 0.3s ease;
        }

        a {
            cursor: pointer;
            text-decoration: underline;

            &:hover {
                color: var(--text-color, #000000);
            }
        }
    }

    h3 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 43px 0 24px 0;

        span {
            font-weight: bold;
            font-size: 20px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
        }

        b {
            font-weight: 400;
            font-size: 14px;
            color: var(--text-color, #000000);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
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

    .details {
        height: 674px;
        border: 1px solid var(--border-color, #F3F3F3);
        border-radius: 8px;
        padding: 13px 15px;
        background: var(--bg-card, #ffffff);
        transition: all 0.3s ease;

        .card {
            border-radius: 12px;
            min-height: 222px;
            border: 1px solid var(--border-color, #F5F5F5);
            background: var(--bg-card, #ffffff);
            transition: all 0.3s ease;
 padding-bottom: 20px;
            .imgContiner {
                height: 160px;
                border-radius: 8px;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    transition: transform 0.3s ease;

                    &:hover {
                        transform: scale(1.02);
                    }
                }
            }

            ul {
                list-style: none;

                li {
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--border-color, #F3F3F3);
                    padding: 0 16px;
                    transition: background-color 0.2s ease;

                    &:hover {
                        background-color: var(--bg-light, #F5F5F5);
                    }

                    span {
                        font-weight: 400;
                        font-size: 14px;
                        color: var(--text-color, #000000);
                        transition: color 0.3s ease;
                    }

                    b {
                        font-weight: 400;
                        font-size: 14px;
                        color: var(--text-color, #000000);
                        transition: color 0.3s ease;
                    }
                }

                li:last-child {
                    border-bottom: none;
                }
            }

            .pline {
                margin: 15px 0 28px 0;
 padding: 0  10px;
                p {
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-gray, #909090);
                    line-height: 24px;
                    transition: color 0.3s ease;
                }
            }

            button {
                width: 100%;
                height: 48px;
                background: #C1272E;
                border-radius: 8px;
                border: none;
                outline: none;
                font-weight: 500;
                font-size: 16px;
                color: #FFFFFF;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    background: #a01f25;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(193, 39, 46, 0.3);
                }

                &:active {
                    transform: translateY(0);
                }
            }

            .wallect {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 17px;
 padding: 0  10px;
                .item {
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-color, #000);
                    display: flex;
                    align-items: center;
                    transition: color 0.3s ease;

                    img {
                        margin-right: 10px;
                        transition: transform 0.2s ease;
                    }

                    &:hover img {
                        transform: scale(1.1);
                    }

                    b {
                        color: var(--text-gray, #909090);
                        font-weight: 400;
                        transition: color 0.3s ease;
                    }
                }
            }
        }
    }
}
</style>