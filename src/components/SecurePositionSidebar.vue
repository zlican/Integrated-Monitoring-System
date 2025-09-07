<!-- SecurePositionSidebar.vue -->
<template>
    <!-- 悬浮按钮 -->
    <button
      ref="toggleBtnRef"
      class="sidebar-toggle"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-controls="secure-position-drawer"
      aria-label="打开或关闭仓位管理计算器"
      @click="toggle()"
    >
      <span v-if="!isOpen">⬅️</span>
      <span v-else>➡️</span>
    </button>
  
    <!-- 抽屉 + 遮罩 放到 body，避免被父容器裁切 -->
    <teleport to="body">
      <!-- 遮罩：点击关闭 -->
      <div
        v-show="isOpen"
        class="scrim"
        @click="close()"
        aria-hidden="true"
      />
  
      <!-- 右侧抽屉 -->
      <aside
        id="secure-position-drawer"
        class="sidebar"
        :class="{ open: isOpen }"
        role="dialog"
        aria-modal="true"
        aria-label="仓位管理计算器"
        ref="sidebarRef"
        @keydown.esc="close()"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
      >
        <div class="drag-hint" aria-hidden="true"></div>
  
        <header class="sidebar-header">
          <h3 class="sidebar-title">仓位管理计算器</h3>
          <button class="close-btn" aria-label="关闭" @click="close()">✕</button>
        </header>
  
        <div class="sidebar-content" ref="contentRef">
          <!-- 这里渲染你的计算器 -->
          <SecurePosition />
        </div>
      </aside>
    </teleport>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
  import SecurePosition from './SecurePosition.vue'
  
  const isOpen = ref(false)
  const toggleBtnRef = ref<HTMLButtonElement | null>(null)
  const sidebarRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  
  // —— 打开/关闭逻辑 —— //
  function lockBodyScroll(lock: boolean) {
    const body = document.body
    if (!body) return
    if (lock) {
      body.dataset.prevOverflow = body.style.overflow || ''
      body.style.overflow = 'hidden'
    } else {
      body.style.overflow = body.dataset.prevOverflow ?? ''
      delete body.dataset.prevOverflow
    }
  }
  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function toggle() {
    isOpen.value = !isOpen.value
  }
  
  // 焦点管理：打开后把焦点移动到第一个可输入元素；关闭后还给按钮
  watch(isOpen, async (openState) => {
    lockBodyScroll(openState)
    if (openState) {
      await nextTick()
      // 找第一个输入控件
      const firstInput = contentRef.value?.querySelector<HTMLElement>(
        'input, select, textarea, button'
      )
      firstInput?.focus()
    } else {
      toggleBtnRef.value?.focus()
    }
  })
  
  onMounted(() => {
    // ESC 在侧边栏内部已经监听；这里可选监听全局 ESC
    document.addEventListener('keydown', onGlobalEsc)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onGlobalEsc)
    lockBodyScroll(false)
  })
  function onGlobalEsc(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) close()
  }
  
  // 移动端右滑关闭
  let touchStartX = 0
  let touchDeltaX = 0
  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    touchDeltaX = 0
  }
  function onTouchMove(e: TouchEvent) {
    touchDeltaX = e.touches[0].clientX - touchStartX
  }
  function onTouchEnd() {
    // 在抽屉内向右滑超过 60px 关闭
    if (touchDeltaX > 60) close()
  }
  </script>
  
  <style scoped>
  :root {
    --sp-width: 520px;
    --glass-bg: rgba(12,16,34,0.92);
    --glass-border: rgba(255,255,255,0.08);
    --accent: #19c37d;
    --shadow: -8px 0 24px rgba(0,0,0,0.55);
  }
  
  /* 悬浮按钮：桌面置中，移动端右下角 */
  .sidebar-toggle {
    position: fixed;
    left: max(24px, env(safe-area-inset-right));
    bottom: 1%;
    transform: translateY(-50%);
    z-index: 1100;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    border: 1px solid color-mix(in oklab, var(--accent) 50%, transparent);
    background: color-mix(in oklab, var(--accent) 20%, transparent);
    cursor: pointer;
    font-size: 36px;
    display: grid;
    place-items: center;
    transition: transform .25s ease, background .25s ease, border-color .25s ease;
    backdrop-filter: blur(8px);
    -webkit-tap-highlight-color: transparent;
  }
  .sidebar-toggle:hover { transform: translateY(-50%) scale(1.05); }
  .sidebar-toggle:active { transform: translateY(-50%) scale(0.97); }
  .sidebar-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  
  @media (max-width: 768px) {
    .sidebar-toggle {
      top: auto;
      bottom: max(24px, env(safe-area-inset-bottom));
      transform: none;
    }
  }
  
  /* 遮罩 */
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(2px);
    z-index: 1098;
    opacity: 1;
    transition: opacity .25s ease;
  }
  
  /* 抽屉 */
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    height: 100dvh;
    width: min(var(--sp-width), 92vw);
    max-width: 560px;
    background: var(--glass-bg);
    border-left: 1px solid var(--glass-border);
    box-shadow: var(--shadow);
    transform: translateX(100%);
    transition: transform .35s cubic-bezier(.2,.8,.2,1);
    z-index: 1099;
    display: flex;
    flex-direction: column;
    padding-right: max(0px, env(safe-area-inset-right));
  }
  .sidebar.open { transform: translateX(0); }
  
  /* 顶部拖拽提示（移动端） */
  .drag-hint {
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .drag-hint::before {
    content: "";
    display: block;
    width: 48px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255,255,255,0.18);
    margin: 12px auto 4px;
  }
  
  /* 头部 */
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px 8px 16px;
    border-bottom: 1px solid var(--glass-border);
  }
  .sidebar-title {
    margin: 0;
    font-size: 24px;
    color: #a0c4ff;
    letter-spacing: .2px;
    font-weight: 600;
  }
  .close-btn {
    width: 36px; height: 36px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color: #cde7ff;
    display: grid; place-items: center;
    cursor: pointer;
    transition: all .2s ease;
  }
  .close-btn:hover { background: rgba(255,255,255,.12); }
  
  /* 内容区 */
  .sidebar-content {
    padding: 14px 16px 18px 16px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  
  /* 减少动画偏好 */
  @media (prefers-reduced-motion: reduce) {
    .sidebar, .scrim, .sidebar-toggle { transition: none !important; }
  }
  </style>
  