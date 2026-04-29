<template>
  <main class="home-landing">
    <section class="hero-card" aria-label="ChooseMe prediction market">
      <div class="hero-copy">
        <h1>Predict the future.<br />Profit from accuracy.</h1>
        <p>Join prediction markets where every forecast is priced, traded, and settled on-chain.</p>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="coin coin-usdt">T</div>
        <div class="coin coin-btc">B</div>
        <div class="core-mark">
          <span></span>
        </div>
        <div class="hand hand-top"></div>
        <div class="hand hand-bottom"></div>
        <div class="growth-bars">
          <i></i>
          <i></i>
          <i></i>
        </div>
      </div>
    </section>

    <section class="products-section">
      <h2>热门产品</h2>

      <article class="product-card" @click="goNodeSale">
        <div class="product-head">
          <div class="product-title-wrap">
            <span class="product-icon">
              <span class="spark spark-one"></span>
              <span class="spark spark-two"></span>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="M5 19h9v18H5V19Zm12 5h13l6 6 7-7v10L34 42H17V24Z" fill="currentColor" opacity=".78" />
                <path d="M17 14h12l8 8H25l-8-8Z" fill="currentColor" opacity=".42" />
              </svg>
            </span>
            <h3>节点购买</h3>
          </div>
          <button class="product-action" type="button">前往购买</button>
        </div>
        <p>成为算力节点，赚取交易手续费 + 市场分红 + 动态收益，多重收益叠加，长期持续回报</p>
      </article>

      <article class="product-card" @click="goNodeStaking">
        <div class="product-head">
          <div class="product-title-wrap">
            <span class="product-icon">
              <span class="spark spark-one"></span>
              <span class="spark spark-two"></span>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="M5 19h9v18H5V19Zm12 5h13l6 6 7-7v10L34 42H17V24Z" fill="currentColor" opacity=".78" />
                <path d="M17 14h12l8 8H25l-8-8Z" fill="currentColor" opacity=".42" />
              </svg>
            </span>
            <h3>节点质押</h3>
          </div>
          <button class="product-action" type="button">前往质押</button>
        </div>
        <p>质押节点，参与“LP+销毁”循环机制，获得稳定收益 + 团队奖励，等级越高收益越高。</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goNodeSale = () => {
  router.push("/computing-power-services");
};

const goNodeStaking = () => {
  router.push("/LPVault");
};

</script>

<style scoped lang="scss">
.home-landing {
  min-height: 100vh;
  background: #202833;
  color: #ffffff;
  padding: 74px 10px 24px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.hero-card {
  position: relative;
  min-height: 186px;
  margin: 0 10px;
  padding: 54px 16px 26px;
  border-radius: 11px;
  overflow: hidden;
  background:
    linear-gradient(132deg, rgba(17, 17, 17, .98) 0%, rgba(17, 17, 17, .98) 42%, rgba(38, 48, 47, .92) 100%),
    #111111;
}

.hero-card::after {
  content: "";
  position: absolute;
  right: -46px;
  bottom: -72px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 46px solid rgba(255, 255, 255, .03);
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 53%;
}

.hero-copy h1 {
  margin: 0;
  color: #ffffff;
  font-family: "Courier New", monospace;
  font-size: 18px;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-copy p {
  margin: 24px 0 0;
  color: #67ff3b;
  font-family: "Courier New", monospace;
  font-size: 9.5px;
  line-height: 1.85;
  letter-spacing: 0;
}

.hero-visual {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.orbit {
  position: absolute;
  border-radius: 50%;
  border: 18px solid rgba(255, 255, 255, .025);
}

.orbit-one {
  width: 190px;
  height: 190px;
  right: -34px;
  top: 30px;
}

.orbit-two {
  width: 120px;
  height: 120px;
  right: 34px;
  top: 64px;
}

.core-mark {
  position: absolute;
  right: 58px;
  top: 88px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 5px rgba(255, 255, 255, .24);
}

.core-mark span {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #67ff3b;
  position: relative;
}

.core-mark span::before,
.core-mark span::after {
  content: "";
  position: absolute;
  left: 13px;
  width: 19px;
  height: 4px;
  border-radius: 99px;
  background: #16202b;
}

.core-mark span::before {
  top: 14px;
}

.core-mark span::after {
  bottom: 14px;
}

.coin {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(103, 255, 59, .72);
  color: #67ff3b;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(103, 255, 59, .12);
}

.coin-usdt {
  right: 128px;
  top: 99px;
}

.coin-btc {
  right: 22px;
  top: 101px;
}

.hand {
  position: absolute;
  width: 112px;
  height: 26px;
  border-radius: 50% 18px 18px 50%;
  background: #f7f7f7;
  border: 2px solid #111111;
}

.hand::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -7px;
  width: 48px;
  height: 39px;
  background: #67ff3b;
  border: 2px solid #111111;
  border-radius: 3px 18px 18px 3px;
}

.hand-top {
  right: 2px;
  top: 45px;
  transform: rotate(-12deg);
}

.hand-bottom {
  right: 74px;
  bottom: 34px;
  transform: rotate(16deg) scaleX(-1);
}

.growth-bars {
  position: absolute;
  right: 20px;
  bottom: 12px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
}

.growth-bars i {
  display: block;
  width: 9px;
  background: #67ff3b;
  clip-path: polygon(50% 0, 100% 24%, 75% 24%, 75% 100%, 25% 100%, 25% 24%, 0 24%);
}

.growth-bars i:nth-child(1) {
  height: 31px;
}

.growth-bars i:nth-child(2) {
  height: 47px;
}

.growth-bars i:nth-child(3) {
  height: 25px;
}

.products-section {
  margin: 34px 10px 0;
}

.products-section h2 {
  margin: 0 0 22px;
  color: #ffffff;
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
}

.product-card {
  background: #2a3440;
  border-radius: 8px;
  padding: 24px 14px 22px;
  margin-bottom: 10px;
  min-height: 160px;
  box-sizing: border-box;
  cursor: pointer;
}

.product-card:active {
  transform: translateY(1px);
}

.product-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, .06);
}

.product-title-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 15px;
}

.product-icon {
  position: relative;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  color: #6f7884;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.product-icon svg {
  width: 40px;
  height: 40px;
}

.spark {
  position: absolute;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #ffd42e;
}

.spark::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 2px;
  background: #2a3440;
  transform: rotate(45deg);
}

.spark-one {
  left: 15px;
  top: -2px;
}

.spark-two {
  right: -2px;
  top: 12px;
}

.product-card h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0;
}

.product-action {
  border: 0;
  border-radius: 8px;
  min-width: 80px;
  height: 32px;
  padding: 0 12px;
  background: #ffd42e;
  color: #111111;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.product-card p {
  margin: 22px 12px 0;
  color: #9da6b2;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 500;
  letter-spacing: 0;
}

@media (min-width: 430px) {
  .home-landing {
    max-width: 430px;
    margin: 0 auto;
  }
}

@media (max-width: 360px) {
  .home-landing {
    padding-left: 6px;
    padding-right: 6px;
  }

  .hero-copy h1 {
    font-size: 16px;
  }

  .hero-copy p {
    font-size: 9px;
  }

  .product-card h3 {
    font-size: 17px;
  }

  .product-action {
    min-width: 74px;
    font-size: 14px;
  }
}
</style>
