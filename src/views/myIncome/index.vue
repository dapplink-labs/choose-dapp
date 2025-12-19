<template>
    <div class="myIncome">
        <div class="header">
            <div class="goback" @click="goBack">
                <el-icon color="#000000">
                    <ArrowLeft />
                </el-icon>
            </div>

            <div class="title">我的LP收益</div>

            <!-- <div class="right"></div> -->
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
                    <el-icon color="#000">
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
</script>

<style scoped lang="scss">
.myIncome {
    // padding-top: 120px;
    min-height: 100vh;


    padding: 120px 10px 0 10px;

    .header {
        position: relative;
        height: 22px;
        display: flex;
        margin-bottom: 35px;
        align-items: center;

        .goback {
            cursor: pointer;
        }

        .title {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-weight: 600;
            font-size: 16px;
            color: #000000;
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
            color: #000000;
            font-weight: 600;
        }

        .tableContent {
            table {
                width: 100%;

                border: 1px solid #F3F3F3;

                thead {
                    tr {
                        th {
                            font-weight: 400;
                            font-size: 14px;
                            color: #909090;
                            height: 50px;
                            border-bottom: 1px solid #F3F3F3;
                        }
                    }
                }

                tbody {
                    tr {
                        td {
                            height: 60px;
                            font-weight: 400;
                            font-size: 14px;
                            color: #000000;
                            border-right: 1px solid #F3F3F3;
                            border-bottom: 1px solid #F3F3F3;
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
                color: #000000;
                font-weight: 600;
            }

            b {
                font-weight: 400;
                font-size: 14px;
                color: #000000;
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
                color: #909090;
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
                background: #F4F4F4;
                flex: 1;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                b {
                    font-weight: 400;
                    font-size: 12px;
                    color: #999999;
                    line-height: 22px;
                }

                p {
                    font-weight: bold;
                    font-size: 24px;
                    color: #000;
                    line-height: 20px;
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
                border: 1px solid #F3F3F3;
                margin-bottom: 10px;

                span {
                    font-weight: 400;
                    font-size: 14px;
                    color: #000000;
                }

                button {
                    width: 64px;
                    height: 28px;
                    background: #C1272E;
                    border-radius: 24px;
                    outline: none;
                    border: #C1272E;
                    font-weight: 400;
                    font-size: 14px;
                    color: #FFFFFF;
                }
            }
        }
    }

    .content {

        .tab {
            display: flex;
            gap: 32px;
            border-bottom: 1px solid #F3F3F3;
            margin-bottom: 20px;

            .item {
                font-weight: 400;
                font-size: 16px;
                width: 32px;
                color: #909090;
                padding-bottom: 15px;
                border-bottom: 2px solid transparent;
            }

            .active {
                font-weight: 400;
                font-size: 16px;
                color: #000;
                width: 32px;
                padding-bottom: 15px;
                border-bottom: 2px solid #000;
            }
        }

        .myLevel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 50px;
            margin-bottom: 16px;
            background: #F4F4F4;
            border-radius: 8px;
            padding: 0 10px;
            font-weight: 600;
            font-size: 14px;

            span {
                color: #909090;
            }

            b {
                color: #000;
            }
        }

        .tree {
            height: 354px;
            border-radius: 8px;
            overflow: hidden;
            background: #000;
        }

        .tableContent {
            table {
                width: 100%;

                border: 1px solid #F3F3F3;

                thead {
                    tr {
                        th {
                            font-weight: 400;
                            font-size: 14px;
                            color: #909090;
                            height: 50px;
                            border-bottom: 1px solid #F3F3F3;
                        }
                    }
                }

                tbody {
                    tr {
                        td {
                            height: 60px;
                            font-weight: 400;
                            font-size: 14px;
                            color: #000000;
                            border-right: 1px solid #F3F3F3;
                            border-bottom: 1px solid #F3F3F3;
                        }

                       

                    }
                }
            }
        }
    }




}</style>