<template>
  <div class="event-pool-page">
    <BackHeaderNav :title="$t('eventPool.title') || '事件池'" />

    <div class="hero">
      <div class="hero-left">
        <div class="hero-text">
          <h2 class="hero-title">
            {{ $t('eventPool.heroTitle') || '对在线事件进行投票' }}
          </h2>
          <p class="hero-title">
            {{ $t('eventPool.heroSub') || '选出你们心中最热门事件' }}
          </p>
          <p class="hero-tip">
            {{ $t('eventPool.heroTip') || '* 持有CHO代币才可以参与事件投票,每个事件只能一个钱包投一次/天' }}
          </p>
        </div>
        <div class="hero-meta">
          <div class="avatars">
            <div v-for="n in 3" :key="n" class="avatar-placeholder"></div>
          </div>
          <div class="hero-count">
            10000{{ $t('eventPool.participateCount') }}
          </div>
        </div>
      </div>
      <div class="hero-right">
        <img class="hero-illustration" src="@/assets/icon/bg45452.png" alt="" />
      </div>
    </div>

    <div class="list">
      <div v-for="card in cards" :key="card.id" class="card">
        <div class="card-header">
          <img class="card-cover" :src="card.cover" alt="" />
          <div class="card-title">
            {{ card.title }}
          </div>
        </div>

        <div class="options">
          <div v-for="opt in card.options" :key="opt.id" class="option-row">
            <div class="option-name">{{ opt.name }}</div>
            <div class="option-percent">{{ opt.percent }}%</div>
            <div class="option-actions">
              <button class="btn-yes" type="button"
                :class="{ active: card.selected === 'yes' && card.votedFor === opt.id }"
                @click="handleVote(card.id, opt.id, 'yes')">
                {{ $t('eventPool.yes') || 'Yes' }}
              </button>
              <button class="btn-no" type="button"
                :class="{ active: card.selected === 'no' && card.votedFor === opt.id }"
                @click="handleVote(card.id, opt.id, 'no')">
                {{ $t('eventPool.no') || 'No' }}
              </button>
            </div>
          </div>
        </div>

        <button v-if="!card.hasVoted" class="primary-btn" type="button" @click="confirmVote(card.id)">
          <span class="primary-btn-text">{{ $t('eventPool.vote') || '投票' }}</span>
          <span class="primary-btn-count">{{ $t('eventPool.currentVotes') }}{{ card.currentVotes }}</span>
        </button>
        <div v-else class="primary-btn disabled">
          <span class="primary-btn-text">{{ $t('eventPool.votedToday') || '今日已投票' }}</span>
          <span class="primary-btn-count">{{ $t('eventPool.currentVotes') }}{{ card.currentVotes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { useThemeStore } from '@/stores/theme'

useI18n()
const themeStore = useThemeStore()

type Option = {
  id: number
  name: string
  percent: number
}

type Card = {
  id: number
  title: string
  cover: string
  options: Option[]
  hasVoted: boolean
  selected: 'yes' | 'no' | null
  votedFor: number | null
  currentVotes: number
}

const cards = reactive<Card[]>([
  {
    id: 1,
    title: '王者荣耀职业联赛夺得冠军的会是哪个战队？',
    cover: 'https://picsum.photos/seed/event1/72/72',
    options: [
      { id: 1, name: '武汉eStarPro', percent: 2 },
      { id: 2, name: '成都AG超玩会', percent: 32 }
    ],
    hasVoted: false,
    selected: null,
    votedFor: null,
    currentVotes: 12345
  },
  {
    id: 2,
    title: '今年全球最受关注的电竞赛事将是哪一项？',
    cover: 'https://picsum.photos/seed/event2/72/72',
    options: [
      { id: 3, name: '英雄联盟全球总决赛', percent: 45 },
      { id: 4, name: 'Dota2 国际邀请赛', percent: 27 }
    ],
    hasVoted: true,
    selected: 'yes',
    votedFor: 3,
    currentVotes: 9876
  }
])

const handleVote = (cardId: number, optionId: number, type: 'yes' | 'no') => {
  const card = cards.find(c => c.id === cardId)
  if (!card || card.hasVoted) return
  card.selected = type
  card.votedFor = optionId
}

const confirmVote = (cardId: number) => {
  const card = cards.find(c => c.id === cardId)
  if (!card || !card.selected || !card.votedFor) return
  card.hasVoted = true
  card.currentVotes += 1
}

onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.event-pool-page {
  min-height: 100vh;
  background-color: var(--bg-page-h5, #000000);
  color: var(--text-color, #ffffff);
  padding: 56px 0 24px;
  box-sizing: border-box;
}

.hero {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 0 16px 19px;
  box-sizing: border-box;
  min-height: 140px;
  border-bottom: 1px solid var(--border-color, #23262F);
  margin-bottom: 16px;

  .hero-left {
    flex: 1;
    display: block;
    padding-top: 21px;
    box-sizing: border-box;
  }

  .hero-text {
    flex: 1;
  }

  .hero-title {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 20px;
    color: var(--bg-opposite, #ffffff);
  }

  .hero-sub {
    margin-top: 10px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #909090;
  }

  .hero-tip {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #909090;
    margin-top: 10px;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
  }

  .avatars {
    display: flex;
    align-items: center;

    .avatar-placeholder {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--bg-page-h5, #000000);
      background: #ffffff;
      margin-right: -6px;
    }
  }

  .hero-count {
    font-size: 12px;
    color: #ffffff;
  }

  .hero-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 120px;
  }

  .hero-illustration {
    width: 100%;
    max-width: 120px;
    max-height: 160px;
    height: auto;
    object-fit: contain;
    object-position: right center;
  }
}

.list {
  padding: 0 16px;
  box-sizing: border-box;
}

.card {
  background: var(--bg-page);
  border-radius: 16px;
  padding: 19px 16px 14px;
  box-sizing: border-box;
  margin-bottom: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;

  .card-cover {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    object-fit: cover;
  }

  .card-title {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    color: var(--bg-opposite);
  }
}

.options {
  margin-bottom: 10px;
}

.option-row {
  display: grid;
  grid-template-columns: 1.7fr 0.7fr 1.2fr;
  align-items: center;
  column-gap: 8px;
  font-size: 13px;

  .option-name,
  .option-percent {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 13px;
    color: var(--bg-opposite);
  }

  .option-percent {
    text-align: right;
  }

  .option-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
}

.btn-yes,
.btn-no {
  width: 60px;
  height: 32px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 14px;
}

.btn-yes {
  margin-bottom: 4px;
  background: var(--button-bg-y);
  color: var(--text-color-y);

  &.active {
    background: var(--text-color-y);
    color: #000000;
  }
}

.btn-no {
  background: var(--button-bg-n);
  color: var(--text-color-n);

  &.active {
    background: var(--text-color-n);
    color: #000000;
  }
}

.primary-btn {
  width: 100%;
  padding: 5px 0;
  border-radius: 8px;
  border: none;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: var(--text-color-y);
  color: #000000;
  font-weight: 700;
  cursor: pointer;

  .primary-btn-text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: #000000;
  }

  .primary-btn-count {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 10px;
    color: #000000;
  }

  &.disabled {
    background: #8F9CAB;
  }
}
</style>
