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

  <!-- 独立显示非理性时刻 -->
  <div 
    v-if="getIrrationalMoment(item.frames)" 
    class="irrational-moment trend-frame"
    
  :class="getIrrationalClass(getIrrationalMoment(item.frames))"
  >
    {{ getIrrationalMoment(item.frames) }}
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

const getIrrationalMoment = (framesData: Record<string, string>) => {
  if (props.kind === 'A') {
    const small = framesData['5m']
    const mid = framesData['15m']
    const large = framesData['1h']

    if (large == "buymacd" && mid == "buymacd" && small == "buymacd") return '多'
    if (large == "sellmacd" && mid == "sellmacd" && small == "sellmacd") return '空'
    return '不管'
  } else {
    const small = framesData['4h']
    const mid = framesData['1d']
    const large = framesData['3d']
    if (large == "buymacd" && mid == "buymacd" && small == "buymacd") return '多'
    if (large == "sellmacd" && mid == "sellmacd" && small == "sellmacd") return '空'
    return '不管'
  }
}
const getIrrationalClass = (status: string) => {
  return {
    'entry-long': status === '多',
    'entry-short': status === '空',
    'none': status ==='不管'
  }
}

const getTrendClass = (trend: string) => {
  return {
    'trend-buymacd': trend === 'buymacd',
    'trend-sellmacd': trend === 'sellmacd',
    'trend-up': trend === 'up',
    'trend-down': trend === 'down',
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
  --color-buymacd: #ffc107;
  --color-sellmacd: #9c27b0;
  --color-up:#ffc107;
  --color-down:#9c27b0;
  --color-flat: #9e9e9e;

  --bg-card: #0d1b36;
  --bg-row: rgba(13, 27, 54, 0.3);
  --border-row: rgba(255, 255, 255, 0.1);
  --shadow-glow: rgba(0, 246, 255, 0.3);

  --chip-radius: 999px;
  --font-size: 22px;

  font-family: "Inter", system-ui, sans-serif;
  font-size: var(--font-size);
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
  font-size: var(--font-size);
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
  font-size: var(--font-size);
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
  font-size: var(--font-size);
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
.trend-buymacd {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.6);
  color: #fff399;
  text-shadow: 0 0 10px #ffc107;
}
.trend-buymacd::before {
  background: var(--color-buymacd);
  box-shadow: 0 0 12px var(--color-buymacd);
}

.trend-sellmacd {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.6);
  color: #d6a1f9;
  text-shadow: 0 0 10px #9c27b0;
}
.trend-sellmacd::before {
  background: var(--color-sellmacd);
  box-shadow: 0 0 12px var(--color-sellmacd);
}

.trend-up {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.6);
  color: #fff399;
  text-shadow: 0 0 10px #ffc107;
}
.trend-up::before {
  background: var(--color-up);
  box-shadow: 0 0 12px var(--color-up);
}

.trend-down {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.6);
  color: #d6a1f9;
  text-shadow: 0 0 10px #9c27b0;
}
.trend-down::before {
  background: var(--color-down);
  box-shadow: 0 0 12px var(--color-down);
}

.trend-flat {
  background: linear-gradient(90deg, 
    rgba(255, 107, 107, 0.2),  /* 柔红 */
    rgba(255, 159, 28, 0.2),   /* 柔橙 */
    rgba(255, 217, 61, 0.2),   /* 柔黄 */
    rgba(29, 211, 176, 0.2),   /* 柔绿 */
    rgba(0, 180, 216, 0.5),    /* 柔蓝 */
    rgba(162, 155, 254, 0.2)   /* 柔紫 */
  );
  background-size: 400% 400%;
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: rainbowMove 6s ease infinite; /* 让渐变流动 */
}

.trend-flat::before {
  background: #fff;
  box-shadow: 0 0 12px #fff;
}

@keyframes rainbowMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* 加载、错误、无数据提示 */
.loading, .error, .no-data {
  text-align: center;
  color: var(--color-primary);
  padding: 20px;
  font-size: var(--font-size);
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
    font-size: var(--font-size);
  }
}
.irrational-moment {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: var(--chip-radius);
  background: rgba(13, 27, 54, 0.6);
  border: 1px solid rgba(0, 246, 255, 0.3);
  font-size: var(--font-size);
  font-weight: 500;
  color: var(--color-primary);
  text-shadow: 0 0 6px rgba(0, 246, 255, 0.6);
  position: relative;
}

/* 小圆点通用样式 */
.irrational-moment::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex: 0 0 auto;
  margin-right: 6px;
}

.entry-long  {
  color: #2fe68d; 
  text-shadow: 0 0 8px #2fe68d;
}
.entry-long::before {
  background: #00E676;
  box-shadow: 0 0 12cqb #00E676;
}
.entry-short  {
  color: #2fe68d; 
  text-shadow: 0 0 8px #2fe68d;
}
.entry-short::before {
  background: #00E676;
  box-shadow: 0 0 12cqb #00E676;
}

.small-entry-long {
  color: #a6a1e9;
  text-shadow: 0 0 2px #a6a1e9;
}
.small-entry-long::before {
  background: #7d88e6;
  box-shadow: 0 0 3px #7d88e6;
}

.small-entry-short {
  color: #a6a1e9;
  text-shadow: 0 0 2px #a6a1e9;
}
.small-entry-short::before {
  background: #7d88e6;
  box-shadow: 0 0 3px #7d88e6;
}

.none {
  color: #aeb0b2;
  text-shadow: 0 0 4px #aeb0b2;
}
.none::before {
  background: #8b8e90;
  box-shadow: 0 0 6px #8b8e90;
}


</style>