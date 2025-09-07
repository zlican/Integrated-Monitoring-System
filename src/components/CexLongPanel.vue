<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>CEX消息(长线)</template>
    <div v-if="error" class="error"></div>
    <ul v-if="messages && messages.length > 0" class="messages-list">
      <li
        v-for="message in messages"
        :key="message.timestamp"
        class="message-item"
        :class="{ highlight: isLatestMinute(message.timestamp) }"
        @click="handleClick(message.text)"
      >
        <div class="message-header">
          <span class="message-time">{{ formatTimeMessage(message.timestamp) }}</span>
        </div>
        <div class="message-content">
          <pre class="message-text">{{ message.text }}</pre>
        </div>
      </li>
    </ul>
    <div v-else-if="!loading" class="no-data">暂无CEX消息</div>


  </CardFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CexMessageL } from '@/types';
import CardFrame from './CardFrame.vue';
import { formatTimeMessage } from '@/utils/format';

const props = defineProps<{
  messages: CexMessageL[] | null;
  loading: boolean;
  error: string | null;
  updatedAt?: string;
}>();


// 取最新的“分钟时间戳”
const latestMinute = computed(() => {
  if (!props.messages || props.messages.length === 0) return null;

  const toMs = (s: string | undefined) => {
    if (!s) return -Infinity;
    const fixed = s.replace(/(\.\d{3})\d+/, '$1'); // 截取到毫秒
    const d = new Date(fixed);
    return isNaN(d.getTime()) ? -Infinity : d.getTime();
  };

  const latest = props.messages.reduce((a, b) =>
    toMs(a.timestamp) >= toMs(b.timestamp) ? a : b
  );

  if (!latest.timestamp) return null;
  const d = new Date(latest.timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
});

// 判断某个消息是否属于最新分钟
const isLatestMinute = (timestamp: string | undefined) => {
  if (!timestamp || !latestMinute.value) return false;
  const d = new Date(timestamp);
  const t = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  return t === latestMinute.value;
};

const updatedAt = computed(() => {
  if (!props.messages || props.messages.length === 0) return '';

  // 用一个稳健的比较函数来找最新（处理可能的多位毫秒）
  const toMs = (s: string | undefined) => {
    if (!s) return -Infinity;
    const fixed = s.replace(/(\.\d{3})\d+/, '$1'); // 截取到毫秒
    const d = new Date(fixed);
    return isNaN(d.getTime()) ? -Infinity : d.getTime();
  };

  const latest = props.messages.reduce((a, b) => (toMs(a.timestamp) >= toMs(b.timestamp) ? a : b));
  return latest.timestamp || '';
});
// 点击事件处理
const handleClick = (text: string) => {
  // 先尝试匹配地址
  const addressMatch = text.match(/[A-Za-z0-9]{30,}/);
  if (addressMatch) {
    const address = addressMatch[0];
    const url = `https://gmgn.ai/sol/token/${address}`;
    window.open(url, '_blank');
    return;
  }

  // 再尝试匹配币种（CEX消息里形如 🔴做空：🔴ETHUSDT）
  const symbolMatch = text.match(/([A-Z]{2,5})USDT/); // 匹配 ETHUSDT、BTCUSDT 等
  if (symbolMatch) {
    const symbol = symbolMatch[1]; // 取 ETH
    const url = `https://www.binance.com/zh-CN/futures/${symbol}USDT`;
    window.open(url, '_blank');
    return;
  }

  alert('未找到有效地址或币种，无法跳转');
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

  --font-size: 22px;
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
  cursor: pointer;
}

.message-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.message-time {
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size);
  color: #a0c4ff;
}

.message-content {
  word-break: break-word;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: var(--font-size);
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
  font-size: var(--font-size);
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
/* highlight class 替代 li:first-child */
.message-item.highlight {
  border-radius: 20px;
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
/* 高亮项 hover 效果 */
.message-item.highlight:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 128, 255, 0.25) 0%,
    rgba(0, 128, 255, 0.15) 40%,
    rgba(0, 0, 0, 0.35) 100%
  );
  box-shadow: 0 0 15px rgba(160, 196, 255, 0.9);
  transform: translateY(-3px) scale(1.03);
  transition: all 0.25s ease-in-out;
}
</style>
