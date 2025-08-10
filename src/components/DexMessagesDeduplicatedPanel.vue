<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>DEX消息（最近1小时去重）</template>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>
    
    <div v-else-if="!deduplicatedMessages || deduplicatedMessages.length === 0" class="no-data">
      暂无DEX消息
    </div>
    
    <ul v-else class="messages-list">
      <li v-for="(message, index) in deduplicatedMessages" :key="index" class="message-item fade-in">
        <div class="message-header">
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <div class="message-content">
          <pre class="message-text" v-html="highlightAddresses(message.text)"></pre>
        </div>
      </li>
    </ul>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DexMessage } from '@/types';
import { useTradesStore } from '@/stores/trades';
import CardFrame from './CardFrame.vue';
import { formatTime } from '@/utils/format';

const props = defineProps<{
  loading: boolean;
  error: string | null;
}>();

const trades = useTradesStore();

// 使用去重的DEX消息
const deduplicatedMessages = computed(() => trades.recentDexMessagesDeduplicated);

const updatedAt = computed(() => {
  if (deduplicatedMessages.value && deduplicatedMessages.value.length > 0) {
    return new Date(deduplicatedMessages.value[0].timestamp).toLocaleTimeString([], { hour12: false });
  }
  return undefined;
});

// 高亮显示地址
const highlightAddresses = (text: string) => {
  return text.replace(
    /(0x[a-fA-F0-9]{40})/g, 
    '<span class="address-highlight">$1</span>'
  );
};
</script>

<style scoped>
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.message-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.message-item:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.message-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.message-time {
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: #a0c4ff;
}

.message-content {
  word-break: break-word;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  color: #ffffff;
  background: transparent;
  border: none;
  padding: 0;
  overflow-wrap: break-word;
}

.address-highlight {
  background: rgba(123, 211, 255, 0.2);
  color: #7bd3ff;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid rgba(123, 211, 255, 0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: #a0c4ff;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(160, 196, 255, 0.3);
  border-top: 2px solid #a0c4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #ff6b6b;
  text-align: center;
}

.error-icon {
  font-size: 18px;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: #a0c4ff;
  opacity: 0.7;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
