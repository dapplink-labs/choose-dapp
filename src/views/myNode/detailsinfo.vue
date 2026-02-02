<template>
    <div class="info" v-if="visible" @click.self="close">
        <div class="content marquee-background">
            <div class="header" style="display: flex; justify-content: center;">
                <el-icon :color="'var(--text-color)'" size="40" @click="close()">
                    <SemiSelect />
                </el-icon>
            </div>

            <h1>{{ $t('myNode.tips')  }}</h1>
            <p>{{ $t('myNode.tipsWarns')  }}</p>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
const   visible =ref(false) 
function refresh() {
    visible.value = true
  // 在这写你的真实逻辑
}

defineExpose({
  refresh
})
function close() {
    visible.value = false
}


</script>

<style  scoped lang="scss">
.theme-dark .marquee-background {
    background: #2F2F2F;
}

.marquee-background {
    background: #F4F4F4;
}

.info {

    top: 0;
    left: 0;
    z-index: 1000;
    background: rgb(0, 0, 0, 0.3);
    position: fixed;
    width: 100vw;
    height: 100vh;

    .content {
        width: calc(100% - 40px);
        height: 150px;
  z-index: 2000;
        h1 {
            font-size: 20px;
            color: var(--text-color, #1a1a1a);
        }

        p {
            font-size: 14px;
            font-weight: normal;
            color: var(--text-color, #1a1a1a);
        }

        position: absolute;
        bottom: 0;
        border-radius: 20px 20px 0 0;
        padding: 10px 20px;
    }
}</style>