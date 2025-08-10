import { onMounted, onBeforeUnmount, ref } from 'vue';

export function usePolling(
  task: () => Promise<void> | void,
  intervalMs: number,
  immediate: boolean = true
) {
  const timer = ref<number | null>(null);
  
  const start = () => {
    if (immediate) Promise.resolve(task());
    stop();
    timer.value = window.setInterval(() => {
      task();
    }, intervalMs);
  };
  
  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  };
  
  onMounted(start);
  onBeforeUnmount(stop);
  
  return { start, stop };
}
