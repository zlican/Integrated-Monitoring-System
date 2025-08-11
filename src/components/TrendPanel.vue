<template>
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>
      <div class="price-title">
        {{ title }}
      </div>
      
    </template>
    
    <div class="trend-container">
    <div v-if="data?.symbols" class="trend-content">
      <div v-for="item in data.symbols" :key="item.base" class="symbol-row">
        <span class="symbol-name">{{ item.base }}:</span>
        <div class="trend-frames">
          <span 
            v-for="frame in frames" 
            :key="frame" 
            class="trend-frame"
            :class="getTrendClass(item.frames[frame])"
          >
            {{ formatFrameLabel(frame) }}({{ getTrendLabel(item.frames[frame]) }})
          </span>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
  </div>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMarketStore } from '@/stores/market';
import { usePolling } from '@/composables/usePolling';
import CardFrame from './CardFrame.vue';
import { getTrendColor, getTrendLabel } from '@/utils/color';

const props = defineProps<{
  kind: 'A' | 'C'; // 只保留A（短线）和C（长线）
  title: string;
  frames?: string[];
}>();

const frames = computed(() => {
  if (props.kind === 'A') {
    return props.frames ?? ['5m', '15m', '1h'];
  } else {
    return props.frames ?? ['4h', '1d', '3d']; // 长线趋势默认时间框架
  }
});
const market = useMarketStore();

const data = computed(() => {
  if (props.kind === 'A') return market.trendA;
  return market.longTermTrend; // 长线趋势
});
const loading = computed(() => {
  if (props.kind === 'A') return market.loading.trendA;
  return market.loading.longTermTrend; // 长线趋势
});
const error = computed(() => {
  if (props.kind === 'A') return market.error.trendA;
  return market.error.longTermTrend; // 长线趋势
});

const formatFrameLabel = (frame: string) => {
  // 为长线趋势添加特殊标签
  if (props.kind === 'C') {
    switch (frame) {
      case '4h': return '4H';
      case '1d': return '1D';
      case '3d': return '3D';
      default: return frame.toUpperCase().replace('M', 'M').replace('H', 'H');
    }
  }
  return frame.toUpperCase().replace('M', 'M').replace('H', 'H');
};

const getTrendClass = (trend: string) => {
  return {
    'trend-bull': trend === 'bull',
    'trend-bear': trend === 'bear',
    'trend-golden': trend === 'golden',
    'trend-dead': trend === 'dead',
    'trend-goldengt': trend === 'goldengt',
    'trend-deadlt': trend === 'deadlt',
    'trend-flat': trend === 'flat'
  };
};

onMounted(() => {
  if (props.kind === 'A') {
    market.fetchTrendA();
  } else {
    market.fetchLongTermTrend(); // 长线趋势
  }
});

// 短线趋势分析使用更快的轮询间隔，长线趋势使用较慢的轮询间隔
const pollingInterval = computed(() => {
  if (props.kind === 'A') return 60000; // 1分钟
  return 1800000; // 30分钟 - 长线趋势更新较慢
});

usePolling(() => {
  if (props.kind === 'A') {
    market.fetchTrendA();
  } else {
    market.fetchLongTermTrend(); // 长线趋势
  }
}, pollingInterval.value, false);
</script>

<style scoped>
.trend-container {
  --color-primary: #00f6ff;
  --color-bull: #ffc107;
  --color-bear: #9c27b0;
  --color-golden: #ffc107;
  --color-dead: #9c27b0;
  --color-goldengt: #ffc107;
  --color-deadlt: #9c27b0;
  --color-flat: #9e9e9e;

  --bg-card: #0d1b36;
  --bg-row: rgba(13, 27, 54, 0.3);
  --border-row: rgba(255, 255, 255, 0.1);
  --shadow-glow: rgba(0, 246, 255, 0.3);

  --chip-radius: 999px;

  font-family: "Inter", system-ui, sans-serif;
  font-size: 15px;
  color: var(--color-primary);
  user-select: none;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.price-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 18px;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}

.symbol-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  background: var(--bg-row);
  border: 1px solid var(--border-row);
  box-shadow:
    0 0 10px rgba(0, 246, 255, 0.1),
    inset 0 0 10px rgba(0, 255, 255, 0.06);
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.symbol-row:hover {
  transform: translateY(-4px);
  background: rgba(13, 27, 54, 0.5);
  box-shadow:
    0 0 28px #00f6ffcc,
    inset 0 0 24px #00ffe6cc;
}

.symbol-name {
  min-width: 90px;
  font-size: 20px;
  color: var(--color-primary);
  letter-spacing: 0.05em;
  user-select: text;
}

.trend-frames {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
  align-items: center;
}

.trend-frame {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(13, 27, 54, 0.6);
  border-radius: var(--chip-radius);
  border: 1px solid rgba(0, 246, 255, 0.3);
  min-width: 72px;
  font-size: 15px;
  font-weight: 400;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.95);
  text-shadow:
    0 0 6px rgba(0, 246, 255, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.trend-frame::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex: 0 0 auto;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* hover 动画，发光浮起 */
.trend-frame:hover {
  transform: translateY(-6px);
  box-shadow:
    0 0 30px var(--shadow-glow);
  cursor: pointer;
}

/* 状态颜色 */
.trend-bull {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.6);
  color: #fff399;
  text-shadow: 0 0 10px #ffc107;
}
.trend-bull::before {
  background: var(--color-golden);
  box-shadow: 0 0 12px var(--color-golden);
}

.trend-bear {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.6);
  color: #d6a1f9;
  text-shadow: 0 0 10px #9c27b0;
}
.trend-bear::before {
  background: var(--color-dead);
  box-shadow: 0 0 12px var(--color-dead);
}

.trend-golden {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.6);
  color: #fff399;
  text-shadow: 0 0 10px #ffc107;
}
.trend-golden::before {
  background: var(--color-golden);
  box-shadow: 0 0 12px var(--color-golden);
}

.trend-goldengt {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.6);
  color: #fff399;
  text-shadow: 0 0 10px #ffc107;
}

.trend-goldengt::before {
  background: var(--color-goldengt);
  box-shadow: 0 0 12px var(--color-goldengt);
}


.trend-dead {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.6);
  color: #d6a1f9;
  text-shadow: 0 0 10px #9c27b0;
}
.trend-dead::before {
  background: var(--color-dead);
  box-shadow: 0 0 12px var(--color-dead);
}

.trend-deadlt {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.6);
  color: #d6a1f9;
  text-shadow: 0 0 10px #9c27b0;
}
.trend-deadlt::before {
  background: var(--color-deadlt);
  box-shadow: 0 0 12px var(--color-deadlt);
}

.trend-flat {
  background: rgba(158, 158, 158, 0.2);
  border-color: rgba(158, 158, 158, 0.6);
  color: #dedede;
  text-shadow: 0 0 10px #9e9e9e;
}
.trend-flat::before {
  background: var(--color-flat);
  box-shadow: 0 0 12px var(--color-flat);
}

/* 加载、错误、无数据提示 */
.loading, .error, .no-data {
  text-align: center;
  color: var(--color-primary);
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  opacity: 0.9;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .symbol-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .symbol-name {
    min-width: 0;
  }
  .trend-frame {
    min-width: auto;
    padding: 8px 14px;
    font-size: 14px;
  }
}
</style>