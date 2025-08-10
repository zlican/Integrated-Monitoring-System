<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>{{ title }}</template>
    
    <div v-if="list.length === 0" class="no-data">暂无交易数据</div>
    <ul v-else class="trade-list">
      <li v-for="trade in list" :key="trade.id" class="trade-item fade-in">
        <div class="trade-header">
          <span class="status-dot" :class="trade.side"></span>
          <span class="symbol">{{ trade.symbol }}</span>
          <span class="time">{{ formatTime(trade.ts) }}</span>
        </div>
        
        <div class="trade-details">
          <div class="detail-row">
            <span class="label">价格:</span>
            <span class="value">{{ formatPrice(trade.price) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">数量:</span>
            <span class="value">{{ formatQuantity(trade.qty) }}</span>
          </div>
        </div>
        
        <div v-if="trade.addr" class="trade-address">
          <span class="label">地址:</span>
          <span class="address" :title="trade.addr">{{ formatAddress(trade.addr) }}</span>
        </div>
        
        <div v-if="trade.txHash" class="trade-hash">
          <span class="label">交易:</span>
          <span class="hash" :title="trade.txHash">{{ formatAddress(trade.txHash, 8, 8) }}</span>
        </div>
      </li>
    </ul>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Trade } from '@/types';
import CardFrame from './CardFrame.vue';
import { formatTime, formatPrice, formatQuantity, formatAddress } from '@/utils/format';

const props = defineProps<{
  title: string;
  list: Trade[];
  updatedAt?: string;
}>();

const updatedAt = computed(() => {
  if (props.list.length === 0) return undefined;
  const latestTrade = props.list[0];
  return latestTrade ? new Date(latestTrade.ts).toLocaleTimeString([], { hour12: false }) : undefined;
});
</script>

<style scoped>
.trade-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
}

.trade-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.trade-item:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.trade-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.symbol {
  font-weight: 700;
  color: #7bd3ff;
  flex: 1;
}

.time {
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: #a0c4ff;
}

.trade-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
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

.trade-address,
.trade-hash {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
}

.address,
.hash {
  color: #00c2ff;
  font-family: 'Courier New', monospace;
  opacity: 0.9;
  word-break: break-all;
}

.no-data {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .trade-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .trade-item {
    padding: 10px;
  }
}
</style>
