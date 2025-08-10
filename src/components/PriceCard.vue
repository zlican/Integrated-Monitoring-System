<template>
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>
      <div class="price-title">
        <span>价格监控</span>
        <button @click="refreshPrice" class="refresh-btn" :disabled="loading">
          <span v-if="loading">刷新中...</span>
          <span v-else>🔄</span>
        </button>
      </div>
    </template>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">
      <div class="error-message">{{ error }}</div>
      <button @click="refreshPrice" class="retry-btn">重试</button>
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
      
      <div class="price-stats">
        <div class="stat-item">
          <span class="stat-label">最后更新:</span>
          <span class="stat-value">{{ formatUpdateTime(data.updatedAt) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">数据源:</span>
          <span class="stat-value">实时API</span>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
  </CardFrame>
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
.price-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.refresh-btn {
  background: none;
  border: none;
  color: #7bd3ff;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(123, 211, 255, 0.1);
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.price-row:last-of-type {
  border-bottom: none;
}

.label {
  font-size: 16px;
  color: #a0c4ff;
  font-weight: 500;
}

.value {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
  font-variant-numeric: tabular-nums;
}

.change-indicator {
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.change-indicator.positive {
  color: #19c37d;
}

.change-indicator.negative {
  color: #ff5a5f;
}

.change-indicator.neutral {
  color: #7bd3ff;
}

.price-stats {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.stat-label {
  color: #7bd3ff;
  opacity: 0.8;
}

.stat-value {
  color: #a0c4ff;
  font-weight: 500;
}

.error {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #ff5a5f;
  margin-bottom: 12px;
  font-size: 14px;
}

.retry-btn {
  background: rgba(255, 90, 95, 0.2);
  border: 1px solid rgba(255, 90, 95, 0.4);
  color: #ff5a5f;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.retry-btn:hover {
  background: rgba(255, 90, 95, 0.3);
  border-color: rgba(255, 90, 95, 0.6);
}

.no-data {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}

.loading {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}
</style>
