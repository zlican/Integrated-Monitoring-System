<template>
  <div class="price-monitor">
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>
      <div class="price-title">
        <span>价格监控</span>
      </div>
    </template>
    
    <div class="price-container">
      <div v-if="error" class="error">
      <div class="error-message">{{ error }}</div>
    </div>
    <div v-else-if="data" class="price-content">
      <div class="price-row">
        <span class="label">BTC:</span>
        <span class="value">{{ formatPrice(data.BTC) }}</span>
        <span class="change-indicator" :class="getPriceChangeClass(data.BTC, previousPrice?.BTC)">
          {{ getPriceChangeIndicator(data.BTC, previousPrice?.BTC) }}
        </span>
      </div>
      <div class="price-row">
        <span class="label">ETH:</span>
        <span class="value">{{ formatPrice(data.ETH) }}</span>
        <span class="change-indicator" :class="getPriceChangeClass(data.ETH, previousPrice?.ETH)">
          {{ getPriceChangeIndicator(data.ETH, previousPrice?.ETH) }}
        </span>
      </div>
    </div>

  </div>
  </CardFrame>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMarketStore } from '@/stores/market';
import { usePolling } from '@/composables/usePolling';
import { API_CONFIG } from '@/config/api';
import CardFrame from './CardFrame.vue';
import { formatPrice } from '@/utils/format';

const market = useMarketStore();
const previousPrice = ref<{ BTC: number; ETH: number } | null>(null);

const data = computed(() => market.price);
const loading = computed(() => market.loading.price);
const error = computed(() => market.error.price);

// 刷新价格数据
const refreshPrice = async () => {
  if (loading.value) return;
  
  // 保存当前价格作为比较基准
  if (data.value) {
    previousPrice.value = { ...data.value };
  }
  
  await market.fetchPrice();
};

// 获取价格变化指示器
const getPriceChangeIndicator = (current: number, previous: number | undefined): string => {
  if (!previous) return '—';
  if (current > previous) return '↗';
  if (current < previous) return '↘';
  return '→';
};

// 获取价格变化样式类
const getPriceChangeClass = (current: number, previous: number | undefined): string => {
  if (!previous) return '';
  if (current > previous) return 'positive';
  if (current < previous) return 'negative';
  return 'neutral';
};

// 格式化更新时间
const formatUpdateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour12: false });
};

onMounted(() => refreshPrice());
usePolling(() => refreshPrice(), API_CONFIG.POLLING.PRICE_INTERVAL, false); // 使用配置的轮询间隔
</script>

<style scoped>
.price-monitor {
  --color-primary: #00f6ff;
  --color-positive: #00f67d;
  --color-negative: #ff4a5f;
  --color-neutral: #7bd3ff;
  --bg-dark: #0b1324;
  --bg-card: #0d1b36;
  --shadow-glow: rgba(0, 246, 255, 0.3);

  font-family: "Inter", system-ui, sans-serif;
  font-size: 15px;
  color: var(--color-primary);
  user-select: none;
}

.price-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 18px;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}



/* 更新时间 */
.updated-time {
  position: absolute;
  right: 28px;
  top: 18px;
  font-size: 13px;
  color: #5599bb;
  letter-spacing: 0.02em;
  user-select: none;
}

/* 价格行卡片 */
.price-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 20px 28px;
  box-shadow:
    0 0 6px #007abfcc,
    inset 0 0 6px #00ffe699;
  cursor: default;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.price-row:hover {
  box-shadow:
    0 0 28px #00f6ffcc,
    inset 0 0 24px #00ffe6cc;
  transform: translateY(-4px);
}

/* 标签 */
.label {
  flex-shrink: 0;
  font-size: 20px;
  width: 45px;
  color: var(--color-primary);
}

/* 价格值 */
.value {
  font-weight: 400;
  font-size: 20px;
  margin-left: 200px;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  text-shadow:
    0 0 8px var(--color-primary),
    0 0 18px var(--color-primary);
  min-width: 140px;
}

/* 价格前美元符号 */
.value::before {
  margin-right: 6px;
  color: var(--color-primary);
  text-shadow:
    0 0 6px var(--color-primary),
    0 0 14px var(--color-primary);
}

/* 涨跌箭头 */
.change-indicator {
  font-size: 28px;
  font-weight: 800;
  width: 32px;
  text-align: center;
  user-select: none;
  transition: transform 0.3s ease;
  line-height: 1;
}

.change-indicator.positive {
  color: var(--color-positive);
  text-shadow:
    0 0 10px var(--color-positive),
    0 0 20px var(--color-positive);
  animation: bounceUp 1.2s ease infinite;
}

.change-indicator.negative {
  color: var(--color-negative);
  text-shadow:
    0 0 10px var(--color-negative),
    0 0 20px var(--color-negative);
  animation: bounceDown 1.2s ease infinite;
}

.change-indicator.neutral {
  color: var(--color-neutral);
  text-shadow: 0 0 10px var(--color-neutral);
}

/* 动画 */
@keyframes bounceUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

/* 错误区 */
.error {
  background: #33000022;
  padding: 28px 20px;
  border-radius: 18px;
  margin: 30px 12px;
  text-align: center;
  box-shadow:
    0 0 24px var(--color-negative);
}

.error-message {
  color: var(--color-negative);
  font-weight: 700;
  font-size: 17px;
  margin-bottom: 16px;
  text-shadow: 0 0 8px var(--color-negative);
}


</style>