<template>
    <CardFrame>
      <template #title>仓位管理计算器</template>
  
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
              v-model.number="price"
              placeholder="请输入当前价格"
              inputmode="decimal"
            />
          </div>
        </div>
  
        <div class="form-item">
          <label class="label" :for="ids.atr">ATR</label>
          <div class="input-wrapper" @click="focusInput('atr')">
            <span class="icon">📈</span>
            <input
              :id="ids.atr"
              ref="atrRef"
              type="number"
              v-model.number="atr"
              placeholder="请输入 ATR"
              inputmode="decimal"
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
              placeholder="请输入最大止损百分比"
              inputmode="decimal"
            />
          </div>
        </div>
      </div>
  
      <!-- 结果展示 -->
      <div class="result" v-if="leverage !== null">
        <p class="value">杠杆：{{ leverage.toFixed(2) }} X </p>
      </div>
      <div v-else class="placeholder">请输入参数以计算杠杆率</div>

          <!-- 右下角清空按钮 -->
    <button class="clear-fab" @click="clearAll" title="清空所有数据">🗑️</button>
    </CardFrame>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue'
  import CardFrame from './CardFrame.vue'
  
  const atr = ref<number | null>(null)
  const price = ref<number | null>(null)
  const maxLoss = ref<number | null>(null)
  
  // 生成稳定的 id，便于 label for 关联
  const ids = {
    price: 'input-price',
    atr: 'input-atr',
    maxLoss: 'input-maxloss',
  }
  
  // 引用以便点击容器时让 input 获得焦点
  const priceRef = ref<HTMLInputElement | null>(null)
  const atrRef = ref<HTMLInputElement | null>(null)
  const maxLossRef = ref<HTMLInputElement | null>(null)
  
  function focusInput(key: 'price' | 'atr' | 'maxLoss') {
    if (key === 'price') priceRef.value?.focus()
    if (key === 'atr') atrRef.value?.focus()
    if (key === 'maxLoss') maxLossRef.value?.focus()
  }
  
  const leverage = computed(() => {
    if (!atr.value || !price.value || !maxLoss.value) return null
    const denom = (atr.value / price.value) * 1.5 * 100
    if (denom <= 0) return null
    return maxLoss.value / denom
  })
  function clearAll() {
  atr.value = null
  price.value = null
  maxLoss.value = null
}
  </script>
  
  <style scoped>
  /* 表单整体：垂直堆叠，但每一项内部是水平布局 */
  .form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin: 20px 0;
    align-items: center;
  }
  
  /* 每一项：水平排列 label 与输入框，同一行 */
  .form-item {
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    max-width: 680px; /* 调整为更宽，适配同一行 */
    flex-wrap: wrap;  /* 在窄屏时允许换行 */
  }
  
  /* 标签：22px，点击聚焦对应输入框 */
  .label {
    font-size: 24px;
    color: #a0c4ff;
    font-weight: 600;
    min-width: 144px; /* 保证对齐，可按需要调整 */
    cursor: pointer;  /* 鼠标手型 */
    user-select: none;
  }
  
  /* 输入框容器：可点击，显示手型 */
  .input-wrapper {

    flex: 1 1 320px;
    min-width: 400px;
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(160, 196, 255, 0.3);
    border-radius: 25px;
    padding: 10px 14px;
    height: 96px;
    transition: all 0.25s ease;
    cursor: pointer; /* 手型 */
  }
  
  .input-wrapper:hover {
    border-color: #64d2ff;
    box-shadow: 0 0 10px rgba(79, 195, 247, 0.35);
    background: rgba(0, 0, 0, 0.3);
  }
  
  .input-wrapper:focus-within {
    border-color: #4fc3f7;
    box-shadow: 0 0 12px rgba(79, 195, 247, 0.6);
    background: rgba(0, 0, 0, 0.35);
  }
  
  .icon {
    margin-right: 12px;
    font-size: 28px;
    opacity: 0.75;
  }
  
  /* 输入框：22px，透明背景 */
  input {
    flex: 1;
    border: none;
    background: transparent;
    color: #fff;
    font-size: 28px;
    outline: none;
    width: 100%;
  }
  
  /* 去除 number 类型的增减按钮（Chrome/Safari/Edge） */
  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* 去除 Firefox 的增减按钮 */
  input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  
  /* 结果区 */
  .result {
    margin-top: 50px;
    text-align: center;
    animation: fadeIn 0.6s ease-in;
  }
  .value {
    font-size: 50px;
    margin-top: 30px;
    font-weight: bold;
    color: #4fc3f7;
    text-shadow: 0 0 12px rgba(79, 195, 247, 0.8);
    animation: pulseGlow 2.5s infinite;
  }
  
  .placeholder {
    margin-top: 32px;
    text-align: center;
    color: #a0c4ff;
    opacity: 0.65;
    font-size: 24px;
  }
  
  /* 动画 */
  @keyframes pulseGlow {
    0% { text-shadow: 0 0 6px rgba(79, 195, 247, 0.6); }
    50% { text-shadow: 0 0 16px rgba(79, 195, 247, 0.9); }
    100% { text-shadow: 0 0 6px rgba(79, 195, 247, 0.6); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* 响应式：在非常窄的屏幕上让标签换行到上方，避免拥挤 */
  @media (max-width: 480px) {
    .form-item {
      flex-direction: column;
      align-items: stretch;
    }
    .label {
      min-width: 0;
    }
    .input-wrapper {
      width: 100%;
    }
  }
  /* 右下角小图标按钮 */
.clear-fab {
  position: absolute;
  right: 20px;
  bottom: 20px;
  background: rgba(79, 195, 247, 0.15);
  border: 1px solid rgba(79, 195, 247, 0.4);
  color: #4fc3f7;
  font-size: 26px;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-fab:hover {
  background: rgba(79, 195, 247, 0.25);
  border-color: #64d2ff;
  box-shadow: 0 0 12px rgba(79, 195, 247, 0.5);
}
  </style>