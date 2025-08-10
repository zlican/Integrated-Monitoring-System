<template>
  <main class="app-container">
    <header class="app-header">
      <h1 class="app-title">交易一体化监控系统</h1>
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

    <div class="grid top">
      <PriceCard />
      <TrendPanel kind="A" title="趋势分析（短线）" />
      <TrendPanel kind="C" title="趋势分析（长线）" />
    </div>

    <div class="grid bottom">
      <TradeList title="CEX交易" :list="latestCex3" />
      <TradeList title="DEX交易" :list="latestDex3" />
      <DexInfoPanel />
    </div>

    <!-- 模拟数据控制面板 -->
    <div class="control-panel">
      <button @click="addMockTrade('cex')" class="control-btn">添加CEX交易</button>
      <button @click="addMockTrade('dex')" class="control-btn">添加DEX交易</button>
      <button @click="refreshAll" class="control-btn refresh">刷新所有数据</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useTradesStore } from '@/stores/trades';
import { useMarketStore } from '@/stores/market';
import { usePolling } from '@/composables/usePolling';
import { useWebSocket } from '@/composables/useWebSocket';
import { apiUtils } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import PriceCard from '@/components/PriceCard.vue';
import TrendPanel from '@/components/TrendPanel.vue';
import TradeList from '@/components/TradeList.vue';
import DexInfoPanel from '@/components/DexInfoPanel.vue';

const trades = useTradesStore();
const market = useMarketStore();
const isOnline = ref(navigator.onLine);
const apiStatus = ref({
  connected: false,
  responseTime: 0,
  lastCheck: ''
});

const latestCex3 = computed(() => trades.latestCex3);
const latestDex3 = computed(() => trades.latestDex3);

// 网络状态监听
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

// 检查API状态
const checkApiStatus = async () => {
  try {
    const status = await apiUtils.getApiStatus();
    apiStatus.value = status;
  } catch (error) {
    console.error('检查API状态失败:', error);
    apiStatus.value = {
      connected: false,
      responseTime: 0,
      lastCheck: new Date().toISOString()
    };
  }
};

// 模拟实时数据
const addMockTrade = (source: 'cex' | 'dex') => {
  trades.addMockTrade(source);
};

// 刷新所有数据
const refreshAll = async () => {
  await Promise.all([
    market.fetchPrice(),
    market.fetchTrendA(),
    market.fetchLongTermTrend(), // 改为长线趋势
    trades.fetchDexInfo()
  ]);
};

onMounted(async () => {
  // 初始化数据
  await trades.initSnapshots();
  
  // 检查API状态
  await checkApiStatus();
  
  // 监听网络状态
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 模拟WebSocket连接（实际使用时替换为真实WebSocket）
  console.log('模拟WebSocket连接...');
  
  // 模拟实时交易数据
  setInterval(() => {
    if (Math.random() > 0.7) {
      trades.addMockTrade('cex');
    }
    if (Math.random() > 0.7) {
      trades.addMockTrade('dex');
    }
  }, 3000);
  
  // 定期检查API状态
  setInterval(checkApiStatus, API_CONFIG.POLLING.STATUS_CHECK_INTERVAL);
  
  // 定期刷新趋势分析数据（短线）
  setInterval(() => {
    market.fetchTrendA();
  }, API_CONFIG.POLLING.TREND_INTERVAL);

  // 新增：定期刷新长线趋势分析数据
  setInterval(() => {
    market.fetchLongTermTrend();
  }, 300000); // 5分钟
});

// 清理事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 20px;
  background: radial-gradient(1200px 600px at 20% 0%, rgba(0,100,200,0.2), transparent), #0c1022;
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
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #cfe9ff;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
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
</style>
