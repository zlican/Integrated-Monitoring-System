<template>
  <CardFrame>
    <template #title>以损定仓</template>

    <!-- 输入表单 -->
    <div class="form">
      <div class="form-item">
        <label class="label" :for="ids.price">当前价格</label>
        <div class="input-wrapper" @click="focusInput('price')">
          <span class="icon">💰</span>
          <input
            :id="ids.price"
            ref="priceRef"
            type="number"
            step="0.01"
            inputmode="decimal"
            autocomplete="off"
            v-model.number="price"
            placeholder="请输入"
          />
        </div>
      </div>

      <!-- 改成止损价格 -->
      <div class="form-item">
        <label class="label" :for="ids.stopLoss">止损价格</label>
        <div class="input-wrapper" @click="focusInput('stopLoss')">
          <span class="icon">📉</span>
          <input
            :id="ids.stopLoss"
            ref="stopLossRef"
            type="number"
            v-model.number="stopLoss"
            placeholder="请输入"
            step="0.01"
            inputmode="decimal"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="form-item">
        <label class="label" :for="ids.maxLoss">最大止损</label>
        <div class="input-wrapper" @click="focusInput('maxLoss')">
          <span class="icon">⚡</span>
          <input
            :id="ids.maxLoss"
            ref="maxLossRef"
            type="number"
            v-model.number="maxLoss"
            placeholder="请输入"
            step="0.01"
            inputmode="decimal"
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <!-- 结果展示 -->
    <div class="result" v-if="leverage !== null">
      <p class="value">杠杆：{{ leverage.toFixed(2) }} X </p>
    </div>
    <div v-else class="placeholder">请输入参数以计算杠杆率</div>

    <!-- 右上角清空按钮 -->
    <button class="clear-fab" @click="clearAll" title="清空所有数据">🗑️</button>
  </CardFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardFrame from './CardFrame.vue'

const price = ref<number | null>(null)
const stopLoss = ref<number | null>(null)
const maxLoss = ref<number>(2)

// id 生成
const ids = {
  price: 'input-price',
  stopLoss: 'input-stoploss',
  maxLoss: 'input-maxloss',
}

// refs
const priceRef = ref<HTMLInputElement | null>(null)
const stopLossRef = ref<HTMLInputElement | null>(null)
const maxLossRef = ref<HTMLInputElement | null>(null)

function focusInput(key: 'price' | 'stopLoss' | 'maxLoss') {
  if (key === 'price') priceRef.value?.focus()
  if (key === 'stopLoss') stopLossRef.value?.focus()
  if (key === 'maxLoss') maxLossRef.value?.focus()
}

const leverage = computed(() => {
  if (!price.value || !stopLoss.value || !maxLoss.value) return null

  const denom = Math.abs(((stopLoss.value - price.value) / price.value)) * 100
  if (denom === 0) return null

  return maxLoss.value / denom
})

function clearAll() {
  price.value = null
  stopLoss.value = null
  maxLoss.value = 2
}
</script>

  
  <style scoped>
:root {
  --field-bg: rgba(0, 0, 0, 0.22);
  --field-border: rgba(160, 196, 255, 0.28);
  --field-hover: rgba(0, 0, 0, 0.28);
  --field-focus: rgba(79, 195, 247, 0.16);
  --field-ring: rgba(79, 195, 247, 0.65);
  --label: #bbd4ff;
  --placeholder: rgba(200,220,255,0.45);
  --result: #4fc3f7;
  --danger: #ff6b6b;
}

/* 表单整体 */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 10px 0 6px;
  align-items: center;
}

/* 每一项 */
.form-item {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 680px;
  flex-wrap: wrap;
  margin-top: 36px;
  margin-left: 18px;
}

/* 标签更轻、更易读 */
.label {
  font-size: 22px;
  color: var(--label);
  font-weight: 600;
  min-width: 120px;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.2px;
}

/* 输入容器：高度更合理，边框更柔 */
.input-wrapper {
  flex: 1 1 320px;
  min-width: 320px;
  display: flex;
  align-items: center;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: 16px;
  padding: 10px 12px;
  height: 60px;
  transition: all 0.2s ease;
  cursor: text; /* 更符合直觉 */
}

.input-wrapper:hover {
  border-color: #64d2ff;
  background: var(--field-hover);
  box-shadow: 0 0 0 3px rgba(100,210,255,0.12);
}

.input-wrapper:focus-within {
  border-color: var(--field-ring);
  background: var(--field-focus);
  box-shadow: 0 0 0 3px rgba(79,195,247,0.25);
}

.icon {
  margin-right: 10px;
  font-size: 22px;
  opacity: 0.75;
}

/* 输入本体 */
input {
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 22px;
  outline: none;
  width: 100%;
}
input::placeholder { color: var(--placeholder); }

/* number 微件去除（保持你的兼容写法） */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; appearance: textfield; }

/* 结果区：层次更明显 */
.result {
  margin-top: 84px;
  text-align: center;
  animation: fadeIn 0.35s ease-in;
}
.value {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  font-size: 48px;
  font-weight: 800;
  color: var(--result);
  text-shadow: 0 0 10px rgba(79, 195, 247, 0.7);
}
.value::before {
  font-size: 22px;
  font-weight: 700;
  color: #c7e7ff;
  letter-spacing: .5px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(79,195,247,.35);
  background: rgba(79,195,247,.08);
}

.stoploss {
  font-size: 28px;
  margin-top: 12px;
  font-weight: 600;
  color: var(--danger);
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.55);
}

.placeholder {
  margin-top: 64px;
  text-align: center;
  font-weight: 700;
  color: #a0c4ff;
  opacity: 0.7;
  font-size: 36px;
}

/* 清空按钮更轻巧，悬浮卡片风 */
.clear-fab {
  position: absolute;
  right: 36px;
  bottom: 36px;
  background: rgba(79, 195, 247, 0.12);
  border: 1px solid rgba(79, 195, 247, 0.35);
  color: #d8f3ff;
  font-size: 28px;
  border-radius: 50px;
  width: 54px;
  height: 54px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.clear-fab:hover {
  background: rgba(79, 195, 247, 0.2);
  border-color: #64d2ff;
  box-shadow: 0 6px 18px rgba(79, 195, 247, 0.22);
}

/* 动画优化 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .value { text-shadow: none; animation: none; }
}

/* 窄屏优化：标签上置，控件占满 */
@media (max-width: 480px) {
  .form-item { flex-direction: column; align-items: stretch; margin-top: 12px; }
  .label { min-width: 0; font-size: 22px; }
  .input-wrapper { min-width: 100%; height: 56px; }
}

  </style>