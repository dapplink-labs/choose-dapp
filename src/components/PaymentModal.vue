<template>
    <transition name="slide-up">
        <div v-if="modelValue" class="trade-overlay" @click.self="handleClose">
            <div class="trade-modal">
                <!-- 顶部拉条 -->
                <div class="grabber" />

                <!-- 1. 顶部切换栏 -->
                <div class="trade-nav">
                    <div class="side-tabs">
                        <button :class="['nav-tab', { active: activeSide === 'buy' }]"
                            @click="activeSide = 'buy'">买入</button>
                        <button :class="['nav-tab', { active: activeSide === 'sell' }]"
                            @click="activeSide = 'sell'">卖出</button>
                    </div>
                    <div class="type-pills">
                        <button :class="['pill', { active: orderType === 'market' }]"
                            @click="orderType = 'market'">市价单</button>
                        <button :class="['pill', { active: orderType === 'limit' }]"
                            @click="orderType = 'limit'">限价单</button>
                    </div>
                </div>

                <div class="trade-body">
                    <!-- 2. 标题与余额 -->
                    <div class="target-info">
                        <h3 class="target-title">尼克斯队对阵湖人队</h3>
                        <div class="target-row">
                            <div class="outcome-badge">尼克斯队 | No
                                <span class="icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11.997"
                                        viewBox="0 0 12 11.997">
                                        <path fill="#e44096"
                                            d="M12.028,5.674h-.994a.126.126,0,0,0-.125.125V9.787H2.652V8.654a.128.128,0,0,0-.028-.081.131.131,0,0,0-.183-.022L.2,10.307a.137.137,0,0,0,0,.206l2.239,1.756a.128.128,0,0,0,.081.028.133.133,0,0,0,.131-.131V11.032h8.383a1.122,1.122,0,0,0,1.12-1.122V5.8a.129.129,0,0,0-.128-.125ZM.28,6.923h.994A.126.126,0,0,0,1.4,6.8V2.81H9.657V3.943a.128.128,0,0,0,.028.081.131.131,0,0,0,.183.022l2.239-1.757a.137.137,0,0,0,0-.206L9.867.328A.128.128,0,0,0,9.786.3a.133.133,0,0,0-.131.131V1.565H1.275A1.122,1.122,0,0,0,.156,2.687V6.8A.125.125,0,0,0,.28,6.923Z"
                                            transform="translate(-0.155 -0.3)" />
                                    </svg>
                                </span>
                            </div>
                            <div class="balance-info">
                                <el-icon>
                                    <Wallet />
                                </el-icon> 余额 $1000.03
                            </div>
                        </div>
                    </div>

                    <div class="divider" />

                    <!-- 3. 限价输入 -->
                    <div class="input-section" v-if="orderType === 'limit'">
                        <label class="input-label">限价</label>
                        <div class="stepper-box">
                            <button class="step-btn" @click="price > 1 && price--">-</button>
                            <div class="step-center">
                                <div class="step-value">{{ price }}¢</div>
                            </div>
                            <button class="step-btn" @click="price < 99 && price++">+</button>
                        </div>
                    </div>

                    <!-- 4. 股数输入 -->
                    <div class="input-section" style="margin-bottom: 10px;">
                        <label class="input-label">股数</label>
                        <div class="stepper-box">
                            <div class="input-box">
                                <input v-model.number="shares" type="number" class="main-input" />
                            </div>
                        </div>
                    </div>
                    <!-- 股数快捷加减，单独占一整行 -->
                    <div class="quick-shares-row">
                        <div class="quick-shares">
                            <button v-for="val in [-100, -10, 10, 100]" :key="val" class="quick-share-btn"
                                @click="adjustShares(val)">
                                {{ val > 0 ? '+' + val : val }}
                            </button>
                        </div>
                    </div>

                    <!-- 5. 杠杆 -->
                    <div class="input-section">
                        <label class="input-label">杠杆</label>
                        <div class="leverage-group">
                            <button :class="['lev-btn', { active: leverage === 2 }]" @click="leverage = 2">x 2</button>
                            <button :class="['lev-btn', { active: leverage === 5 }]" @click="leverage = 5">🚀 x
                                5</button>
                            <button :class="['lev-btn', { active: leverage === 10 }]" @click="leverage = 10">🔥 x
                                MAX</button>
                        </div>
                        <p class="leverage-tip">最大可用杠杆: 10 X (暂未开放)</p>
                    </div>

                    <!-- 6. 结算汇总 -->
                    <div class="summary-section">
                        <div class="summary-row">
                            <span class="s-label">总计</span>
                            <span class="s-value">${{ totalCost }}</span>
                        </div>
                        <div class="summary-row">
                            <span class="s-label">可获得</span>
                            <span class="s-value-gain">💵 +${{ potentialGain }}</span>
                        </div>
                    </div>

                    <!-- 7. 执行按钮 -->
                    <button class="execute-btn" @click="handleConfirm">
                        Buy No
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Wallet } from '@element-plus/icons-vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const activeSide = ref('buy')
const orderType = ref('limit')
const price = ref(48)
const shares = ref(100)
const leverage = ref(2)

const totalCost = computed(() => ((price.value * shares.value) / 100).toFixed(2))
const potentialGain = computed(() => shares.value.toFixed(2))

function adjustShares(val) {
    shares.value = Math.max(0, shares.value + val)
}

function handleClose() { emit('update:modelValue', false) }
function handleConfirm() { console.log('Trade Confirmed') }
</script>

<style scoped lang="scss">
.trade-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
}

.trade-modal {
    width: 100%;
    background: #0b0b0b;
    border-radius: 20px 20px 0 0;
    padding: 8px 16px calc(24px + env(safe-area-inset-bottom));
    color: #fff;
    font-family: sans-serif;
}

.grabber {
    width: 40px;
    height: 4px;
    background: #333;
    border-radius: 2px;
    margin: 0 auto 16px;
}

/* 导航切换 */
.trade-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);

    .side-tabs {
        display: flex;
        gap: 20px;


        .nav-tab {
            background: none;
            border: none;
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 18px;
            padding: 4px 0;
            cursor: pointer;
            padding-bottom: 12px;
            color: #909090;


            &.active {
                color: #ccff33;
                border-bottom: 2px solid #ccff33;
            }
        }
    }

    .type-pills {
        background: #1a1a1a;
        padding: 4px;
        border-radius: 6px;
        display: flex;

        .pill {
            border: none;
            background: none;
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: #909090;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;

            &.active {
                background: #333;
                color: #fff;
            }
        }
    }
}

/* 目标信息 */
.target-info {
    .target-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: var(--bg-opposite);
        margin: 0 0 12px;
    }

    .target-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .outcome-badge {
        background: rgba(202, 64, 100, 0.2);
        color: #CA4064;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .balance-info {
        color: #888;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
}

.divider {
    height: 1px;
    background: #1a1a1a;
    margin: 20px 0;
}

/* 输入区域 */
.input-section {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap; // 方便提示文字换行

    .input-label {
        width: 50px;
        font-size: 15px;
        font-weight: bold;
        color: #eee;
    }
}

.stepper-box {
    flex: 0.8;
    background: #151515;
    border: 1px solid #222;
    border-radius: 12px;
    display: flex;
    align-items: center;
    height: 48px;
    overflow: hidden;

    .step-btn {
        width: 50px;
        height: 100%;
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;

        &:active {
            background: #222;
        }
    }

    .step-center {
        flex: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.2;
    }

    .step-value {
        font-size: 18px;
        font-weight: 800;
    }

    .step-sub {
        margin-top: 2px;
        font-size: 12px;
        color: #777;
    }
}


.input-box {
    flex: 1;
    background: #151515;
    border: 1px solid #222;
    border-radius: 12px;
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;

    .main-input {
        width: 100%;
        background: none;
        border: none;
        color: #fff;
        text-align: right;
        font-size: 18px;
        font-weight: bold;
        outline: none;
    }
}

.quick-shares-row {
    margin: 8px 0 0;
    display: flex;
    justify-content: flex-end; // 整行按钮靠右对齐
}

.quick-shares {
    display: flex;
    gap: 8px;

    .quick-share-btn {
        background: #222;
        border: none;
        color: #ccc;
        padding: 6px 15px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
    }
}

/* 杠杆 */
.leverage-group {
    flex: 0.8;
    display: flex;
    gap: 8px;
    justify-content: flex-end; // 杠杆按钮靠右

    .lev-btn {
        flex: 1;
        background: #222;
        border: none;
        color: #888;
        padding: 10px 0;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;

        // &.active {
        //     background: #eee;
        //     color: #000;
        // }
    }
}

.leverage-tip {
    padding-bottom: 20px;
    font-size: 11px;
    color: #555;
    text-align: right;
    width: 100%;
    flex-basis: 100%; // 在 flex 容器中独占一整行
    border-bottom: 1px solid var(--border-color);
}

/* 汇总 */
.summary-section {
    margin: 24px 0;

    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .s-label {
            color: #888;
            font-size: 15px;
            font-weight: bold;
        }

        .s-value {
            font-size: 18px;
            font-weight: 900;
        }

        .s-value-gain {
            font-size: 18px;
            font-weight: 900;
            color: #ccff33;
        }
    }
}

/* 确认按钮 */
.execute-btn {
    width: 100%;
    height: 52px;
    background: #ccff33;
    border: none;
    border-radius: 14px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: #000000;
    cursor: pointer;
    transition: transform 0.1s;

    &:active {
        transform: scale(0.98);
    }
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>