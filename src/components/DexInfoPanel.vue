<template>
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>DEX信息 (最近1小时)</template>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="data?.items" class="dex-content">
      <div class="controls">
        <label class="sort-label">排序:</label>
        <select v-model="sortKey" class="sort-select">
          <option value="volumeUsd">成交量</option>
          <option value="txCount">交易笔数</option>
          <option value="priceChange1h">价格变化</option>
        </select>
      </div>
      
      <div class="dex-list">
        <div v-for="item in sortedItems" :key="`${item.token}-${item.pair}`" class="dex-item fade-in">
          <div class="item-header">
            <span class="token-name">{{ item.token }}</span>
            <span class="chain-name">{{ item.chain }}</span>
          </div>
          
          <div class="item-details">
            <div class="detail-row">
              <span class="label">交易对:</span>
              <span class="value">{{ item.pair }}</span>
            </div>
            <div class="detail-row">
              <span class="label">交易笔数:</span>
              <span class="value">{{ formatNumber(item.txCount) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">成交量:</span>
              <span class="value">${{ formatNumber(item.volumeUsd) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">1H变化:</span>
              <span class="value" :class="item.priceChange1h >= 0 ? 'positive' : 'negative'">
                {{ item.priceChange1h >= 0 ? '+' : '' }}{{ item.priceChange1h.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无DEX数据</div>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useTradesStore } from '@/stores/trades';
import { usePolling } from '@/composables/usePolling';
import CardFrame from './CardFrame.vue';
import { formatNumber } from '@/utils/format';

const trades = useTradesStore();
const sortKey = ref<'volumeUsd' | 'txCount' | 'priceChange1h'>('volumeUsd');

const data = computed(() => trades.dexInfo);
const loading = computed(() => trades.loading.dexInfo);
const error = computed(() => trades.error.dexInfo);

const sortedItems = computed(() => {
  if (!data.value?.items) return [];
  
  return [...data.value.items]
    .sort((a, b) => (b[sortKey.value] ?? 0) - (a[sortKey.value] ?? 0))
    .slice(0, 15);
});

onMounted(() => trades.fetchDexInfo());
usePolling(() => trades.fetchDexInfo(), 60000, false);
</script>

<style scoped>
.dex-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sort-label {
  font-size: 14px;
  color: #a0c4ff;
}

.sort-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #cfe9ff;
  padding: 4px 8px;
  font-size: 14px;
  outline: none;
}

.sort-select:focus {
  border-color: #7bd3ff;
}

.dex-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.dex-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.dex-item:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.token-name {
  font-weight: 700;
  color: #7bd3ff;
  font-size: 16px;
}

.chain-name {
  font-size: 12px;
  color: #a0c4ff;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.item-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 12px;
  color: #a0c4ff;
  opacity: 0.8;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #cfe9ff;
}

.value.positive {
  color: #19c37d;
}

.value.negative {
  color: #ff5a5f;
}

.no-data {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .item-details {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .dex-item {
    padding: 10px;
  }
  
  .controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
