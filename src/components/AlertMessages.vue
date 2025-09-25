<template>
    <CardFrame :updatedAt="updatedAt">
      <template #title>⚡️首次警报</template>
  
      <div class="messages-container">
  
        <!-- 正常数据 -->
        <ul v-if="alerts.length" class="messages-list">
          <li
            v-for="alert in alerts"
            :key="alert.timestamp"
            :class="['message-item clickable', { 'highlight': isLatestMinute(alert.timestamp) }]"
            @click="handleClick(alert.text)"
          >
            <div class="message-header">
              <span class="message-time">{{ formatTimeMessage(alert.timestamp) }}</span>
              <span class="message-category" :class="alert.category === '短线' ? 'short' : 'long'">
                {{ alert.category }}
              </span>
            </div>
  
            <div class="message-content">
              <pre class="message-text">{{ alert.text }}</pre>
              <div class="reason">原因：{{ alert.reason }}</div>
            </div>
          </li>
        </ul>
  
        <!-- 无数据 -->
        <div v-else class="no-data">暂无告警消息</div>
      </div>
    </CardFrame>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import CardFrame from './CardFrame.vue';
  import { formatTimeMessage } from '@/utils/format';
  interface AlertMessage {
    category: string; // 短线 / 中线
    text: string;
    timestamp: string;
    reason: string;
  }
  
  const alerts = ref<AlertMessage[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  
  // 获取数据
  const fetchAlerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch('http://127.0.0.1:9001/alert/list');
      if (!res.ok) throw new Error(`请求失败: ${res.status}`);
      const data = await res.json();
      alerts.value = data.reverse();
    } catch (err: any) {
      error.value = err.message || '请求失败';
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    fetchAlerts()
    window.setInterval(fetchAlerts, 10000); // 每 10 秒拉取一次
  });
  
  // 最新分钟（高亮）
  const latestMinute = computed(() => {
    if (!alerts.value.length) return null;
    const latest = alerts.value[0];
    if (!latest.timestamp) return null;
    const d = new Date(latest.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  });
  
  const isLatestMinute = (timestamp: string | undefined) => {
    if (!timestamp || !latestMinute.value) return false;
    const d = new Date(timestamp);
    const t = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    return t === latestMinute.value;
  };
  
  const updatedAt = computed(() => {
    if (!alerts.value.length) return '';
    return new Date(alerts.value[0].timestamp).toLocaleTimeString([], { hour12: false });
  });
  
  // 点击跳转逻辑
  const handleClick = (text: string) => {
    // 地址优先
    const addressMatch = text.match(/[A-Za-z0-9]{30,}/);
    if (addressMatch) {
      window.open(`https://gmgn.ai/sol/token/${addressMatch[0]}`, '_blank');
      return;
    }
    // 币种 (ETHUSDT / BTCUSDT)
    const symbolMatch = text.match(/([A-Z]{2,6})USDT/);
    if (symbolMatch) {
      const symbol = symbolMatch[1];
      window.open(`https://www.binance.com/zh-CN/futures/${symbol}USDT`, '_blank');
      return;
    }
    alert('未找到有效跳转目标');
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
    --font-size: 22px;
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

  
  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .message-time {
    color: #a0c4ff;
    font-size: var(--font-size);
  }
  .message-category {
    font-size: var(--font-size);
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 6px;
  }
  .message-category.short {
    background: rgba(0, 200, 0, 0.15);
    color: #4ade80;
  }
  .message-category.long {
    background: rgba(255, 165, 0, 0.15);
    color: #facc15;
  }
  .message-content {
    word-break: break-word;
  }
  .message-text {
    margin: 0;
    white-space: pre-wrap;
    font-family: inherit;   /* 这一行 */
  font-size: var(--font-size);
  line-height: 1.4;       /* 这一行 */
    color: #fff;
  }
  .reason {
    margin-top: 6px;
    font-size: 14px;
    color: #7bd3ff;
    opacity: 0.8;
  }
  
  /* loading, error, no-data */
  .loading-overlay {
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
  @keyframes spin { 100% { transform: rotate(360deg); } }
  
  .error { color: #ff6b6b; padding: 20px; text-align: center; }
  .no-data { color: #a0c4ff; padding: 20px; opacity: 0.7; }
  
  @keyframes highlightPulse {
    0%,100% { box-shadow: 0 0 6px rgba(160, 196, 255, 0.4); transform: scale(1); }
    50% { box-shadow: 0 0 12px rgba(160, 196, 255, 0.7); transform: scale(1.015); }
  }
  </style>
  