<template>
    <CardFrame :updatedAt="updatedAt">
      <template #title>封禁区管理</template>
  
      <!-- 输入区域 -->
      <div class="ban-input">
        <input
          v-model="newSymbol"
          type="text"
          placeholder="输入要封禁的币种 (如 BTCUSDT)"
          class="ban-input-field"
          @keyup.enter="handleAdd"
        />
        <button class="ban-add-btn" @click="handleAdd" :disabled="loadingAdd">
          {{ loadingAdd ? '添加' : '添加' }}
        </button>
      </div>
  
      <!-- 列表区域 -->
      <ul v-if="symbols.length > 0" class="ban-list">
        <li v-for="s in symbols" :key="s" class="ban-item">
          <span class="ban-symbol">{{ s }}</span>
          <button class="ban-remove-btn" @click="handleRemove(s)" :disabled="loadingRemove === s">
            {{ loadingRemove === s ? '删除' : '删除' }}
          </button>
        </li>
      </ul>
  
      <div v-else class="no-data">暂无封禁的标的</div>
    </CardFrame>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import CardFrame from './CardFrame.vue';
  
  // 封禁列表数据
  const symbols = ref<string[]>([]);
  const newSymbol = ref('');
  const loadingAdd = ref(false);
  const loadingRemove = ref('');
  const updatedAt = ref('');
  const ip = "192.168.1.12"
  
  const fetchSymbols = async () => {
    try {
      const res = await fetch(`http://${ip}:9001/ban/list`);
      symbols.value = await res.json();
      updatedAt.value = new Date().toISOString();
    } catch (err) {
      console.error('获取封禁区失败:', err);
    }
  };
  
  const handleAdd = async () => {
  let symbol = newSymbol.value.trim().toUpperCase();
  if (!symbol) return;

  // 如果没有以 USDT 结尾，自动补上
  if (!symbol.endsWith("USDT")) {
    symbol += "USDT";
  }

  loadingAdd.value = true;
  try {
    await fetch(`http://${ip}:9001/ban/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    newSymbol.value = "";
    fetchSymbols();
  } catch (err) {
    console.error("添加失败:", err);
  } finally {
    loadingAdd.value = false;
  }
};
  
  const handleRemove = async (symbol: string) => {
    loadingRemove.value = symbol;
    try {
      await fetch(`http://${ip}:9001/ban/remove/${symbol}`, { method: 'DELETE' });
      fetchSymbols();
    } catch (err) {
      console.error('删除失败:', err);
    } finally {
      loadingRemove.value = '';
    }
  };
  
  onMounted(fetchSymbols);
  </script>

<style>
:root {
  --font-stack: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans SC";
  --radius: 10px;
  --border: rgba(255,255,255,0.06);
  --glass-bg: rgba(0,0,0,0.28);
  --accent: #19c37d;
  --danger: #ff5a5f;
  --muted: #a0c4ff;
  --symbol: #19c37d;
  --text: #ffffff;
  --transition: 200ms;
  --font-size: 22px;
}
</style>
  
  <style scoped>

  
  /* 基础盒模型 */
  * { box-sizing: border-box; }
  :host, :root { -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
  
  /* =========================
     输入区
     ========================= */
  .ban-input {
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 12px 0 18px;
  }
  
  .ban-input-field {
    flex: 1;
    min-width: 0;                     /* 可让 input 在 flex 容器内正确换行/收缩 */
    font-family: var(--font-stack);
    font-size: var(--font-size);
    padding: 10px 14px;
    border-radius: calc(var(--radius) + 2px);
    border: 1px solid var(--border);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.25));
    color: var(--text);
    outline: none;
    transition: box-shadow var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
  }
  
  /* 占位符更柔和 */
  .ban-input-field::placeholder {
    color: rgba(160,196,255,0.35);
    font-weight: 400;
  }
  
  /* focus 可见性（无障碍） */
  .ban-input-field:focus {
    box-shadow: 0 8px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.02);
    border-color: rgba(27,180,100,0.6);
    transform: translateY(-1px);
  }
  
  /* =========================
     添加按钮（主操作）
     ========================= */
  .ban-add-btn {
    display:inline-flex;
    align-items:center;
    font-size: var(--font-size);
    gap:8px;
    padding: 9px 16px;
    margin-right: 11px;
    border-radius: calc(var(--radius) - 2px);
    background: linear-gradient(180deg, rgba(25,195,125,0.12), rgba(25,195,125,0.06));
    border: 1px solid rgba(25,195,125,0.35);
    color: var(--accent);
    font-weight: 400;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
    user-select: none;
  }
  
  /* hover / active / disabled */
  .ban-add-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(25,195,125,0.08); }
  
  /* =========================
     列表 & 项目
     ========================= */
  .ban-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  /* 每一行的视觉风格 */
  .ban-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border-radius: calc(var(--radius) + 2px);
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.25));
    border: 1px solid var(--border);
    color: var(--text);
    transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
    will-change: transform;
    animation: fadeInUp 220ms ease both;
  }
  
  /* 悬停抬升效果 */
  .ban-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 40px rgba(0,0,0,0.48);
    border-color: rgba(255,255,255,0.12);
  }
  
  /* symbol 文字及前置小标识 */
  .ban-symbol {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size);
    font-weight: 400;
    color: var(--symbol);
    letter-spacing: 0.6px;
  }
  
  /* 圆点小图标（纯 CSS，无需图片） */
  .ban-symbol::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), var(--symbol));
    box-shadow: 0 4px 12px rgba(123,211,255,0.06), inset 0 0 6px rgba(255,255,255,0.02);
    display: inline-block;
    flex: 0 0 12px;
  }
  
  /* 删除按钮（危险操作） */
  .ban-remove-btn {
    flex: 0 0 auto;
    padding: 7px 12px;
    font-size: var(--font-size);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255,90,95,0.08), rgba(255,90,95,0.04));
    border: 1px solid rgba(255,90,95,0.28);
    color: var(--danger);
    font-weight: 400;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  }
  
  .ban-remove-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(255,90,95,0.06); }
  
  /* 无数据文案 */
  .no-data {
    text-align: center;
    color: var(--muted);
    opacity: 0.9;
    margin-top: 8px;
    font-weight: 400;
  }
  
  /* 可选的更新时间小字（如果模板里加上） */
  .updated-at {
    font-size: var(--font-size);
    color: rgba(255,255,255,0.56);
    margin-top: 8px;
    text-align: right;
  }
  
  /* =========================
     动画（入场、移除）与无动画兼容
     ========================= */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOutDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(8px); }
  }
  
  /* 当 JS 给项加上 .removing 时可平滑消失（示例） */
  .ban-item.removing { animation: fadeOutDown 180ms ease both; opacity: 0.001; pointer-events: none; }
  
  /* =========================
     响应式与无障碍偏好
     ========================= */
  @media (max-width: 520px) {
    .ban-input { gap: 8px; }
    .ban-input-field { font-size: var(--font-size); padding: 9px 10px; }
    .ban-add-btn { padding: 8px 12px; font-size: var(--font-size); }
    .ban-item { padding: 10px 12px; gap: 10px; }
    .ban-symbol { font-size: var(--font-size); }
  }
  
  /* 减少动画偏好 */
  @media (prefers-reduced-motion: reduce) {
    .ban-item, .ban-add-btn, .ban-remove-btn, .ban-input-field { transition: none !important; animation: none !important; }
  }
  
  /* 高对比偏好（提升边框对比） */
  @media (prefers-contrast: more) {
    .ban-item, .ban-input-field { border-color: rgba(255,255,255,0.18); }
  }
  
  /* 小工具类（暗用作辅助隐藏或屏幕阅读器文本） */
  .hidden-visually {
    position: absolute !important;
    height: 1px; width: 1px;
    overflow: hidden; clip: rect(1px,1px,1px,1px);
    white-space: nowrap;
  }
  </style>
  