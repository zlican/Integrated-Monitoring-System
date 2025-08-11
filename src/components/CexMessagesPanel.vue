<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>CEX消息</template>
    <div v-if="error" class="error"></div>
    <ul v-if="messages && messages.length > 0" class="messages-list">
      <li
        v-for="message in messages"
        :key="message.timestamp"
        class="message-item"
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
import type { CexMessage } from '@/types';
import CardFrame from './CardFrame.vue';
import { formatTimeMessage } from '@/utils/format';

const props = defineProps<{
  messages: CexMessage[] | null;
  loading: boolean;
  error: string | null;
  updatedAt?: string;
}>();

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
  transform: scale(1.02);
  transition: all 0.3s ease;
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
