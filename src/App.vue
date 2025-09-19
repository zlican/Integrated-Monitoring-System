<template>
  <main class="app-container">
    <header class="app-header">
      <img src="/banner.png" alt="交易一体化监控系统" class="app-logo" />
    </header>

    <div class="grid bottom">
      <CexMessagesPanel :messages="displayedCexMessages" :loading="trades.loading.cexMessages"
        :error="trades.error.cexMessages" />
      <CexLongPanel :messages="displayedCexMessagesL" :loading="trades.loading.cexLong" :error="trades.error.cexLong" />
      <DexMessagesDeduplicatedPanel :messages="displayedDexMessages" :loading="trades.loading.dexMessages"
        :error="trades.error.dexMessages" />
        <CexBanListPanel />
        <DexBanListPanel />
        <SecurePosition />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useTradesStore } from '@/stores/trades';
import CexMessagesPanel from '@/components/CexMessagesPanel.vue';
import DexMessagesDeduplicatedPanel from '@/components/DexMessagesDeduplicatedPanel.vue';
import CexLongPanel from './components/CexLongPanel.vue';
import CexBanListPanel from './components/CexBanListPanel.vue';
import DexBanListPanel from './components/DexBanListPanel.vue';
import SecurePosition from './components/SecurePosition.vue';

const trades = useTradesStore();

const isOnline = ref(navigator.onLine);

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


onMounted(async () => {
  await trades.fetchCexMessages();
  await trades.fetchCexMessagesL();
  await trades.fetchDexMessages();

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);


  setInterval(() => {
    trades.fetchCexMessages();
  }, 10000);
  setInterval(() => {
    trades.fetchCexMessagesL();
  }, 30000);

  setInterval(() => {
    trades.fetchDexMessages();
  }, 10000);

});

onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.app-logo {
  height: 72px;
  /* 根据需求调整 */
  width: 360px;
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
  padding: 10px;
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
  font-size: 36px;
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
  font-size: 36px;
}

.size {
  font-size: 36px;
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
