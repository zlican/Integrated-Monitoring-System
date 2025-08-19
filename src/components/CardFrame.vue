<template>
  <section class="card fade-in">
    <header class="card-head">
      <h3 class="title">
        <slot name="title" />
      </h3>
      <div v-if="updatedAt" class="updated">
        Updated: {{ formatTime(updatedAt) }}
      </div>
    </header>
    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/format';

defineProps<{
  updatedAt?: string;
}>();
</script>

<style scoped>
.card-body {
  min-height: 60px;
}

.updated {
  font-size: 20px;
}
</style>
