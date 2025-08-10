<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>DEX消息</template>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>
    
    <div v-else-if="!messages || messages.length === 0" class="no-data">
      暂无DEX消息
    </div>
    
    <ul v-else class="messages-list">
      <li
      v-for="message in messages"
      :key="message.timestamp"
      :class="['message-item clickable', { 'fade-in': firstLoad }]"
      @click="handleClick(message.text)">
        <div class="message-header">
          <span class="message-time">{{ formatTimeMessage(message.timestamp) }}</span>
        </div>
        
        <div class="message-content">
          <pre class="message-text">{{ message.text }}</pre>
        </div>
      </li>
    </ul>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DexMessage } from '@/types';
import CardFrame from './CardFrame.vue';
import { formatTimeMessage } from '@/utils/format';

const props = defineProps<{
  messages: DexMessage[] | null;
  loading: boolean;
  error: string | null;
  updatedAt?: string;
}>();
// 1. 用 ref + watch 保持 updatedAt 稳定
import { ref, watch } from 'vue';

const updatedAt = ref('');

watch(() => props.messages, (newMessages) => {
  if (!newMessages || newMessages.length === 0) {
    updatedAt.value = '';
    return;
  }
  const latest = newMessages.reduce((a, b) => new Date(a.timestamp).getTime() >= new Date(b.timestamp).getTime() ? a : b);
  updatedAt.value = latest.timestamp || '';
}, { immediate: true });
// 点击事件处理：从文本提取地址，跳转新窗口
const handleClick = (text: string) => {
  const match = text.match(/[A-Za-z0-9]{30,}/);
  if (!match) {
    alert('未找到有效地址，无法跳转');
    return;
  }
  const address = match[0];
  const url = `https://web3.okx.com/zh-hans/token/solana/${address}`;

  // 新开一个带参数的新浏览器窗口（非tab）
  window.open(url, '_blank');
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

  /* 固定高度为5个li的高度 */
  max-height: calc((60px + 12px) * 7); /* 60px是li的高度，12px是gap */
  overflow-y: auto; /* 只纵向滚动 */
  overflow-x: hidden; /* 禁止横向滚动 */
}

/* 滚动条美化（可选） */
.messages-list::-webkit-scrollbar {
  width: 6px;
}
.messages-list::-webkit-scrollbar-thumb {
  background: rgba(160, 196, 255, 0.5);
  border-radius: 3px;
}
.messages-list::-webkit-scrollbar-track {
  background: transparent;
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
.clickable {
  cursor: pointer;
}
</style>
