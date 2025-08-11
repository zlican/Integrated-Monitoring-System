<template>
  <CardFrame :updatedAt="updatedAt">
    <template #title>CEX等待区</template>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-if="messages && messages.length" class="messages-list">
      <li
        v-for="(message, idx) in messages"
        :key="message.timestamp || idx"
        class="message-item"
      >
        <div class="message-content">
          <pre class="message-text">{{ message.text }}</pre>
        </div>
      </li>
    </ul>
    <div v-else-if="!loading" class="no-data">暂无等待区消息</div>
  </CardFrame>
  
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CexMessage } from '@/types';
import CardFrame from './CardFrame.vue';

const props = defineProps<{
  messages: CexMessage[] | null;
  loading: boolean;
  error: string | null;
  updatedAt?: string;
}>();

const updatedAt = computed(() => props.updatedAt || (props.messages && props.messages[0]?.timestamp) || '');

// 因为前面在store里把 timestamp 拼上了序号，这里展示时间需剥离
const displayTime = (ts?: string) => {
  if (!ts) return '';
  const real = ts.split('-')[0];
  return real;
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
  max-height: calc((108px + 12px) * 5);
  overflow-y: auto;
  overflow-x: hidden;
}

.messages-list::-webkit-scrollbar { width: 3px; }
.messages-list::-webkit-scrollbar-thumb { background: rgba(160, 196, 255, 0.5); border-radius: 3px; }
.messages-list::-webkit-scrollbar-track { background: transparent; }

.message-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.message-item:hover { background: rgba(0, 0, 0, 0.35); border-color: rgba(255, 255, 255, 0.2); transform: translateX(4px); }

.message-content { word-break: break-word; }
.message-text { margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 18px; line-height: 1.4; color: #ffffff; background: transparent; border: none; padding: 0; overflow-wrap: break-word; }

.error { padding: 20px; color: #ff6b6b; text-align: center; }
.no-data { padding: 20px; text-align: center; color: #a0c4ff; opacity: 0.7; }
</style>


