<template>
  <CardFrame :updatedAt="data?.updatedAt">
    <template #title>{{ title }}</template>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="data?.symbols" class="trend-content">
      <div v-for="item in data.symbols" :key="item.base" class="symbol-row">
        <span class="symbol-name">{{ item.base }}:</span>
        <div class="trend-frames">
          <span 
            v-for="frame in frames" 
            :key="frame" 
            class="trend-frame"
            :class="getTrendClass(item.frames[frame])"
            :style="{ color: getTrendColor(item.frames[frame]) }"
          >
            {{ formatFrameLabel(frame) }}({{ getTrendLabel(item.frames[frame]) }})
          </span>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
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
.trend-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.symbol-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.symbol-name {
  font-weight: 700;
  color: #7bd3ff;
  font-size: 16px;
  min-width: 60px;
}

.trend-frames {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: 20px;
}

.trend-frame {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  min-width: 80px;
  text-align: center;
  transition: all 0.3s ease;
}

.trend-frame:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.trend-bull {
  background: rgba(25, 195, 125, 0.2);
  border: 1px solid rgba(25, 195, 125, 0.4);
}

.trend-bear {
  background: rgba(255, 90, 95, 0.2);
  border: 1px solid rgba(255, 90, 95, 0.4);
}

.trend-golden {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.4);
}

.trend-dead {
  background: rgba(156, 39, 176, 0.2);
  border: 1px solid rgba(156, 39, 176, 0.4);
}

.trend-flat {
  background: rgba(158, 158, 158, 0.2);
  border: 1px solid rgba(158, 158, 158, 0.4);
}

.loading {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}

.error {
  text-align: center;
  color: #ff5a5f;
  padding: 20px;
  opacity: 0.8;
}

.no-data {
  text-align: center;
  color: #7bd3ff;
  padding: 20px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .trend-frames {
    margin-left: 0;
  }
  
  .trend-frame {
    min-width: 70px;
    font-size: 13px;
  }
}
</style>
