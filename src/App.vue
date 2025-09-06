<template>
  <main class="app-container">
    <header class="app-header">
      <img src="/banner.png" alt="交易一体化监控系统" class="app-logo" />
      <div class="app-status">
        <div class="status-row">
          <span class="status-indicator" :class="{ online: isOnline }"></span>
          {{ isOnline ? '在线' : '离线' }}
        </div>
        <div class="status-row">
          <span class="api-status-indicator" :class="{ connected: apiStatus.connected }"></span>
          API: {{ apiStatus.connected ? '已连接' : '未连接' }}
          <span v-if="apiStatus.connected" class="response-time">({{ apiStatus.responseTime }}ms)</span>
        </div>
      </div>
    </header>

    <div class="grid bottom">
      <CexMessagesPanel :messages="displayedCexMessages" :loading="trades.loading.cexMessages"
        :error="trades.error.cexMessages" />
      <CexLongPanel :messages="displayedCexMessagesL" :loading="trades.loading.cexLong" :error="trades.error.cexLong" />
      <DexMessagesDeduplicatedPanel :messages="displayedDexMessages" :loading="trades.loading.dexMessages"
        :error="trades.error.dexMessages" />






      <CexMessagesWaitingPanel :messages="trades.cexWaitingMessages?.messages || []"
        :loading="trades.loading.cexWaiting" :error="trades.error.cexWaiting"
        :updatedAt="trades.cexWaitingMessages?.updatedAt" />
      <CexLongWaitingPanel :messages="trades.cexWaitingMessagesL?.messages || []"
        :loading="trades.loading.cexWaitingLong" :error="trades.error.cexWaitingLong"
        :updatedAt="trades.cexWaitingMessagesL?.updatedAt" />
      <DexMessagesWaitingPanel :messages="trades.dexWaitingMessages?.messages || []"
        :loading="trades.loading.dexWaiting" :error="trades.error.dexWaiting"
        :updatedAt="trades.dexWaitingMessages?.updatedAt" />
      <SecurePositionSidebar />
    </div>

    <div class="control-panel">
      <button @click="handleRefresh" class="control-btn refresh" :disabled="loadingRefresh">
        <span v-if="!loadingRefresh">🔄</span>
        <span v-else class="spinner">🔄</span>
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useTradesStore } from '@/stores/trades';
import { useMarketStore } from '@/stores/market';
import { apiUtils } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import PriceCard from '@/components/PriceCard.vue';
import TrendPanel from '@/components/TrendPanel.vue';
import CexMessagesPanel from '@/components/CexMessagesPanel.vue';
import CexMessagesWaitingPanel from '@/components/CexMessagesWaitingPanel.vue';
import DexMessagesWaitingPanel from '@/components/DexMessagesWaitingPanel.vue';
import DexMessagesDeduplicatedPanel from '@/components/DexMessagesDeduplicatedPanel.vue';
import SecurePosition from './components/SecurePosition.vue';
import CexLongPanel from './components/CexLongPanel.vue';
import CexLongWaitingPanel from './components/CexLongWaitingPanel.vue';
import SecurePositionSidebar from './components/SecurePositionSidebar.vue';

const trades = useTradesStore();
const market = useMarketStore();

const isOnline = ref(navigator.onLine);
const apiStatus = ref({
  connected: false,
  responseTime: 0,
  lastCheck: ''
});

// 稳定引用，避免 CEX 消息闪烁
import type { CexMessage, CexMessageL, DexMessage } from '@/types';
const displayedCexMessages = ref<CexMessage[]>([]);
watch(() => trades.cexMessages?.messages, (newMessages) => {
  if (!newMessages) {
    displayedCexMessages.value = [];
    return;
  }
  const oldMap = new Map(displayedCexMessages.value.map((m: CexMessage) => [m.timestamp, m]));
  const updated = newMessages.map((m: CexMessage) => oldMap.get(m.timestamp) || m);
  const oldKeys = displayedCexMessages.value.map(m => m.timestamp).join(',');
  const newKeys = updated.map(m => m.timestamp).join(',');
  if (oldKeys !== newKeys) {
    displayedCexMessages.value = updated;
  }
}, { immediate: true });


const displayedCexMessagesL = ref<CexMessageL[]>([]);
watch(() => trades.cexMessagesL?.messages, (newMessages) => {
  if (!newMessages) {
    displayedCexMessagesL.value = [];
    return;
  }
  const oldMap = new Map(displayedCexMessagesL.value.map((m: CexMessage) => [m.timestamp, m]));
  const updated = newMessages.map((m: CexMessage) => oldMap.get(m.timestamp) || m);
  const oldKeys = displayedCexMessagesL.value.map(m => m.timestamp).join(',');
  const newKeys = updated.map(m => m.timestamp).join(',');
  if (oldKeys !== newKeys) {
    displayedCexMessagesL.value = updated;
  }
}, { immediate: true });

// 重点：稳定引用，避免 DEX 消息闪烁
const displayedDexMessages = ref<DexMessage[]>([]);
watch(() => trades.dexMessages?.messages, (newMessages) => {
  if (!newMessages) {
    displayedDexMessages.value = [];
    return;
  }
  const oldMap = new Map(displayedDexMessages.value.map((m: DexMessage) => [m.timestamp, m]));
  const updated = newMessages.map((m: DexMessage) => oldMap.get(m.timestamp) || m);
  const oldKeys = displayedDexMessages.value.map(m => m.timestamp).join(',');
  const newKeys = updated.map(m => m.timestamp).join(',');
  if (oldKeys !== newKeys) {
    displayedDexMessages.value = updated;
  }
}, { immediate: true });

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

const loadingRefresh = ref(false);

const handleRefresh = async () => {
  if (loadingRefresh.value) return; // 防止重复点击
  loadingRefresh.value = true;

  try {
    await refreshAll();  // 调用之前定义的真实数据刷新函数
  } catch (error) {
    console.error('刷新失败:', error);
  } finally {
    loadingRefresh.value = false;
  }
};


const refreshAll = async () => {
  try {
    // 同步触发所有真实 API 请求
    await Promise.all([
      trades.fetchCexMessages(),     // CEX 消息
      trades.fetchDexMessages(),     // DEX 消息
      trades.fetchCexWaitingMessages(), // CEX等待区
      trades.fetchDexWaitingMessages(),  // DEX等待区
      trades.fetchCexMessagesL(),
      trades.fetchCexWaitingMessagesL(),

    ]);
  } catch (error) {
    console.error('刷新所有数据失败:', error);
  }
};
onMounted(async () => {
  await trades.fetchCexMessages();
  await trades.fetchCexWaitingMessages();
  await trades.fetchCexMessagesL();
  await trades.fetchCexWaitingMessagesL();
  await trades.fetchDexMessages();
  await trades.fetchDexWaitingMessages();

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);


  setInterval(() => {
    trades.fetchCexMessages();
  }, 30000);
  setInterval(() => {
    trades.fetchCexMessagesL();
  }, 30000);

  setInterval(() => {
    trades.fetchDexMessages();
  }, 30000);

  setInterval(() => {
    trades.fetchDexWaitingMessages();
  }, 30000);

  setInterval(() => {
    trades.fetchCexWaitingMessages();
  }, 30000);
  setInterval(() => {
    trades.fetchCexWaitingMessagesL();
  }, 30000);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.app-logo {
  height: 100px;
  /* 根据需求调整 */
  width: auto;
}

.app-container {
  min-height: 100vh;
  padding: 20px;
  background: radial-gradient(1200px 600px at 20% 0%, rgba(0, 100, 200, 0.2), transparent), #0c1022;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  backdrop-filter: blur(10px);
}

.app-title {
  color: #7bd3ff;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.app-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #a0c4ff;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5a5f;
  transition: background-color 0.3s ease;
}

.status-indicator.online {
  background: #19c37d;
}

.api-status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5a5f;
  transition: background-color 0.3s ease;
}

.api-status-indicator.connected {
  background: #19c37d;
}

.response-time {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}

.control-panel {
  position: fixed;
  bottom: 36px;
  right: 36px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.control-btn {
  width: 64px;
  /* 按钮大小，可按需调整 */
  height: 64px;
  font-size: 36px;
  /* 图标字体大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  /* 去掉默认内边距 */
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.control-btn.refresh {
  background: rgba(25, 195, 125, 0.2);
  border-color: rgba(25, 195, 125, 0.4);
}

.control-btn.refresh:hover {
  background: rgba(25, 195, 125, 0.3);
  border-color: rgba(25, 195, 125, 0.6);
}

@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .app-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .app-title {
    font-size: 24px;
  }

  .control-panel {
    bottom: 16px;
    right: 16px;
  }

  .control-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
