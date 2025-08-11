<template>
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>{{ title }}</template>
    
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
  --accent: #7bd3ff;
  --row-border: rgba(255,255,255,0.05);
  --chip-radius: 999px;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.symbol-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--row-border);
  transition: background 0.18s ease, transform 0.18s ease;
}
.symbol-row:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.04);
}

.symbol-name {
  min-width: 84px;
  font-weight: 700;
  font-size: 18px; /* 字体加大 */
  color: var(--accent);
  letter-spacing: 0.3px;
}

.trend-frames {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
  align-items: center;
}

.trend-frame {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: var(--chip-radius);
  border: 1px solid rgba(255,255,255,0.05);
  min-width: 64px;
  font-size: 14px; /* 字体加大 */
  font-weight: 600;
  white-space: nowrap;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  color: rgba(255,255,255,0.92);
}
.trend-frame::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex: 0 0 auto;
}

/* hover 动画：更轻盈的抬起感 */
.trend-frame:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(3,8,20,0.55);
  cursor: pointer;
}
/* 状态颜色统一对比度 */
.trend-bull {
  background: rgba(25,195,125,0.12);
  border-color: rgba(25,195,125,0.3);
  color: #9fffd5;
}
.trend-bull::before {
  background: #19c37d;
}

.trend-bear {
  background: rgba(255,90,95,0.12);
  border-color: rgba(255,90,95,0.3);
  color: #ffb3b6;
}
.trend-bear::before {
  background: #ff5a5f;
}

.trend-golden {
  background: rgba(255,193,7,0.12);
  border-color: rgba(255,193,7,0.3);
  color: #ffe58a;
}
.trend-golden::before {
  background: #ffc107;
}

.trend-dead {
  background: rgba(156,39,176,0.12);
  border-color: rgba(156,39,176,0.3);
  color: #e7b3ff;
}
.trend-dead::before {
  background: #9c27b0;
}

.trend-flat {
  background: rgba(158,158,158,0.12);
  border-color: rgba(158,158,158,0.3);
  color: #cccccc;
}
.trend-flat::before {
  background: #9e9e9e;
}

.loading, .error, .no-data {
  text-align: center;
  color: var(--accent);
  padding: 14px;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .symbol-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .symbol-name {
    min-width: 0;
  }
}
</style>