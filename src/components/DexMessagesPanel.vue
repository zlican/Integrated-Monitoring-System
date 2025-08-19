<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>DEX消息</template>
    
    <div class="messages-container">
    
      <ul v-if="displayedMessages.length" class="messages-list">
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
  </div>
  </CardFrame>
</template>

<script setup lang="ts">
import { ref, watch , computed } from 'vue';
import type { DexMessage } from '@/types';
import CardFrame from './CardFrame.vue';
import { formatTimeMessage } from '@/utils/format';

const props = defineProps<{
  messages: DexMessage[] | null;
  loading: boolean;
  error: string | null;
  updatedAt?: string;
}>();

const updatedAt = ref('');

const displayedMessages = ref<DexMessage[]>([]);

watch(() => props.messages, (newMessages) => {
  if (newMessages && newMessages.length > 0) {
    displayedMessages.value = newMessages;
  } else {
    // 不要立刻清空，loading结束后再清空（可选，按需）
    if (!props.loading) {
      displayedMessages.value = [];
    }
  }
}, { immediate: true });

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
  const url = `https://gmgn.ai/sol/token/${address}`;

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
  margin: 2px;
  padding: 2px;

  /* 固定高度为5个li的高度 */
  max-height: calc((108px + 12px) * 5); /* 60px是li的高度，12px是gap */
  overflow-y: auto; /* 只纵向滚动 */
  overflow-x: hidden; /* 禁止横向滚动 */
}

/* 滚动条美化（可选） */
.messages-list::-webkit-scrollbar {
  width: 3px;
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
  font-size: 20px;
  color: #a0c4ff;
}

.message-content {
  word-break: break-word;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 20px;
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
  font-size: 20px;
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
  font-size: 20px;
  z-index: 10;
  pointer-events: none;
}
</style>
