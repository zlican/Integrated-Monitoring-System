<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>DEX消息（最近1小时去重）</template>
    <div class="messages-container">
      <ul v-if="displayedMessages.length" class="messages-list">
      <li v-for="message in deduplicatedMessages" 
      :key="message.timestamp"
      :class="['message-item clickable', { 'fade-in': firstLoad }]"
      @click="handleClick(message.text)">
        <div class="message-header">
          <span class="message-time">{{ formatTimeMessage(message.timestamp) }}</span>
        </div>
        
        <div class="message-content">
          <pre class="message-text" v-html="highlightAddresses(message.text)"></pre>
        </div>
      </li>
    </ul>
  </div>
  </CardFrame>
</template>

<script setup lang="ts">
import {  computed, ref, watch} from 'vue';
import type { DexMessage } from '@/types';
import { useTradesStore } from '@/stores/trades';
import CardFrame from './CardFrame.vue';
import { formatTimeMessage } from '@/utils/format';

const props = defineProps<{
  loading: boolean;
  error: string | null;
}>();

const trades = useTradesStore();

// 使用去重的DEX消息
const deduplicatedMessages = computed(() => trades.recentDexMessagesDeduplicated);

// 本地缓存用于显示，防止闪烁
const displayedMessages = ref<DexMessage[]>([]);

watch(deduplicatedMessages, (newVal) => {
  if (newVal && newVal.length > 0) {
    displayedMessages.value = newVal;
  } else if (!props.loading) {
    // 数据为空且非加载状态时清空
    displayedMessages.value = [];
  }
}, { immediate: true });

const updatedAt = computed(() => {
  if (deduplicatedMessages.value && deduplicatedMessages.value.length > 0) {
    return new Date(deduplicatedMessages.value[0].timestamp).toLocaleTimeString([], { hour12: false });
  }
  return undefined;
});
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
/* 高亮第一个 li（保留圆角） */
.messages-list li:first-child {
  border-radius: 20px; /* 保留原有圆角 */
  background: linear-gradient(
    135deg,
    rgba(0, 128, 255, 0.15) 0%,
    rgba(0, 128, 255, 0.05) 40%,
    rgba(0, 0, 0, 0.25) 100%
  );
  padding: 12px;
  margin-left: 12px;
  margin-right: 12px;
  border: 1px solid rgba(160, 196, 255, 0.6);
  box-shadow: 0 0 6px rgba(160, 196, 255, 0.4);
  animation: highlightPulse 2.5s ease-in-out infinite;
  position: relative;
  transform: scale(1.02);
  transition: all 0.3s ease;
}
/* 呼吸动画 */
@keyframes highlightPulse {
  0% {
    box-shadow: 0 0 6px rgba(160, 196, 255, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 12px rgba(160, 196, 255, 0.7);
    transform: scale(1.015);
  }
  100% {
    box-shadow: 0 0 6px rgba(160, 196, 255, 0.4);
    transform: scale(1);
  }
}

/* 悬停增强效果（均匀发光，不集中在右上角） */
.messages-list li:first-child:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 128, 255, 0.25) 0%,
    rgba(0, 128, 255, 0.15) 40%,
    rgba(0, 0, 0, 0.35) 100%
  );
  box-shadow: 0 0 10px rgba(160, 196, 255, 0.7);
  transform: translateX(4px);
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
.clickable {
  cursor: pointer;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(12, 16, 34, 0.75);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #a0c4ff;
  font-weight: 600;
  font-size: 16px;
  z-index: 10;
  pointer-events: none;
}
</style>
