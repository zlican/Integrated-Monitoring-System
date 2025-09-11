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
          {{ loadingAdd ? '添加中...' : '添加' }}
        </button>
      </div>
  
      <!-- 列表区域 -->
      <ul v-if="symbols.length > 0" class="ban-list">
        <li v-for="s in symbols" :key="s" class="ban-item">
          <span class="ban-symbol">{{ s }}</span>
          <button class="ban-remove-btn" @click="handleRemove(s)" :disabled="loadingRemove === s">
            {{ loadingRemove === s ? '删除中...' : '删除' }}
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
  
  const fetchSymbols = async () => {
    try {
      const res = await fetch('http://192.168.1.11:9001/ban/list');
      symbols.value = await res.json();
      updatedAt.value = new Date().toISOString();
    } catch (err) {
      console.error('获取封禁区失败:', err);
    }
  };
  
  const handleAdd = async () => {
    if (!newSymbol.value.trim()) return;
    loadingAdd.value = true;
    try {
      await fetch('http://192.168.1.11:9001/ban/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol.value.trim().toUpperCase() }),
      });
      newSymbol.value = '';
      fetchSymbols();
    } catch (err) {
      console.error('添加失败:', err);
    } finally {
      loadingAdd.value = false;
    }
  };
  
  const handleRemove = async (symbol: string) => {
    loadingRemove.value = symbol;
    try {
      await fetch(`http://192.168.1.11:9001/ban/remove/${symbol}`, { method: 'DELETE' });
      fetchSymbols();
    } catch (err) {
      console.error('删除失败:', err);
    } finally {
      loadingRemove.value = '';
    }
  };
  
  onMounted(fetchSymbols);
  </script>
  
  <style scoped>
  .ban-input {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .ban-input-field {
    flex: 1;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid rgba(160, 196, 255, 0.4);
    background: rgba(0, 0, 0, 0.25);
    color: #fff;
    font-size: 16px;
  }
  
  .ban-add-btn {
    padding: 8px 16px;
    border-radius: 10px;
    background: rgba(25, 195, 125, 0.2);
    border: 1px solid rgba(25, 195, 125, 0.4);
    color: #19c37d;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .ban-add-btn:hover {
    background: rgba(25, 195, 125, 0.3);
    border-color: rgba(25, 195, 125, 0.6);
  }
  
  .ban-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  .ban-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    transition: all 0.2s ease;
  }
  .ban-item:hover {
    background: rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .ban-symbol {
    font-size: 18px;
    font-weight: 600;
    color: #7bd3ff;
  }
  
  .ban-remove-btn {
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(255, 90, 95, 0.2);
    border: 1px solid rgba(255, 90, 95, 0.4);
    color: #ff5a5f;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .ban-remove-btn:hover {
    background: rgba(255, 90, 95, 0.3);
    border-color: rgba(255, 90, 95, 0.6);
  }
  
  .no-data {
    text-align: center;
    color: #a0c4ff;
    opacity: 0.7;
    margin-top: 12px;
  }
  </style>
  