<template>
    <div class="LPVault">
        <div class="header">
            <div class="goback" @click="goBack">
                <el-icon color="#000000">
                    <ArrowLeft />
                </el-icon>
            </div>



            <div class="right">
                <img src="@/assets/images/share.svg" alt="" style="width: 16px;">
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
            <b>我的LP收益
                <el-icon color="#000">
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

<script  setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue"
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
    }
    ,
    {
        name: "T4共识节点",
        index: 3
    }
    ,
    {
        name: "T5超级节点",
        index: 4
    }, {
        name: "T6创世节点",
        index: 5
    }

])
function tab(index) {
    active.value = index

}
const active = ref(0)
</script>

<style scoped lang="scss">
.LPVault {
    .hide-scroll {
        overflow: auto;
        scrollbar-width: none;
        /* Firefox */
        -ms-overflow-style: none;
        /* IE / Edge 旧版 */
    }

    .hide-scroll::-webkit-scrollbar {
        display: none;
        /* Chrome / Safari */
    }

    .tab {
        display: flex;
        gap: 20px;
        border-bottom: 1px solid #F3F3F3;
        margin-bottom: 20px;
        overflow-x: auto;
        /* 开启横向滚动 */
        white-space: nowrap;

        .item {
            font-weight: 400;
            font-size: 16px;
            width: 90px;
            flex-shrink: 0;
            color: #909090;
            padding-bottom: 15px;
            border-bottom: 2px solid transparent;
        }

        .active {
            flex-shrink: 0;
            font-weight: 400;
            font-size: 16px;
            color: #000;
            width: 90px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
        }
    }

    min-height: 100vh;


    padding: 120px 10px 60px 10px;

    .header {
        position: relative;
        height: 22px;
        display: flex;
        margin-bottom: 13px;
        align-items: center;
        justify-content: space-between;

        .goback {
            cursor: pointer;
        }



    }

    .intro {
        h1 {
            font-weight: bold;
            font-size: 28px;
            color: #000000;
        }

        p,
        a {
            font-weight: 400;
            font-size: 12px;
            color: #909090;
            line-height: 18px;
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
            color: #000000;
        }

        b {
            font-weight: 400;
            font-size: 14px;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
    }

    .details {
        height: 674px;
        border: 1px solid #F3F3F3;
        border-radius: 8px;
        padding: 13px 15px;

        .card {
            border-radius: 12px;
            min-height: 222px;

            border: 1px solid #F5F5F5;

            .imgContiner {
                height: 160px;

                img {
                    width: 100%;
                    height: 100%;

                    object-fit: cover;
                    object-position: center;
                }
            }

            ul {
                list-style: none;

                li {
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #F3F3F3;
                    padding: 0 16px;

                    span {
                        font-weight: 400;
                        font-size: 14px;
                        color: #000000;
                    }

                    b {
                        font-weight: 400;
                        font-size: 14px;
                        color: #000000;
                    }
                }

                li:last-child {
                    border-bottom: none;
                }
            }

            .pline {
                margin: 15px 0 28px 0;

                p {
                    font-weight: 400;
                    font-size: 12px;
                    color: #909090;
                    line-height: 24px;
                }
            }

            button {
                width: 100%;
                height: 48px;
                background: #C1272E;
                border-radius: 8px 8px 8px 8px;
                border: none;
                outline: none;
                font-weight: 500;
                font-size: 16px;
                color: #FFFFFF;
            }

            .wallect {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 17px;

                .item {
                    font-weight: 400;
                    font-size: 12px;
                    color: #000;
                    display: flex;
                    align-items: center;

                    img {
                        margin-right: 10px;
                    }

                    b {
                        color: #909090;
                        font-weight: 400;
                    }
                }
            }
        }
    }
}
</style>