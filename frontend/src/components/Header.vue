<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'create'): void;
}>();

const date = ref(new Date());
const formatDateVn = () => {
  const formatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date.value);

  return formatted.replace('tháng', 'Tháng');
};
</script>

<template>
  <div class="mb-space-xl">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <div class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-space-xs">
          {{ formatDateVn() }}
        </div>
        <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold outline-none cursor-text">
          Hôm nay
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
          Tập trung vào những điều quan trọng nhất. Giữ tâm trí rõ ràng và nhẹ
          nhàng.
        </p>
      </div>

      <!-- Nút tạo task mới (Minimalist ghost button) -->
      <button
        type="button"
        @click="emit('create')"
        class="self-start sm:self-auto sm:mt-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100/80 transition-colors text-[13px] cursor-pointer flex-shrink-0 group"
        title="Tạo nhiệm vụ mới"
      >
        <span class="material-symbols-outlined text-[14px] text-neutral-400 group-hover:text-neutral-600 transition-colors">add</span>
        <span>Thêm nhiệm vụ</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>