<script setup>
import { computed } from 'vue';

const props = defineProps({
  todos: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['toggle', 'delete']);

const completedCount = computed(() => props.todos.length);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'HIGH':
      return {
        label: '#cao',
        class: 'text-rose-400/80 font-normal',
      };
    case 'MEDIUM':
      return {
        label: '#trung-bình',
        class: 'text-amber-500/80 font-normal',
      };
    case 'LOW':
      return {
        label: '#thấp',
        class: 'text-neutral-400 font-normal',
      };
    default:
      return null;
  }
};
</script>

<template>
  <section v-if="completedCount > 0" class="pt-space-md">
    <!-- Tiêu đề: ĐÃ HOÀN THÀNH + Số lượng -->
    <div class="flex items-center justify-between pb-space-sm mb-space-xs">
      <h2 class="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
        Đã hoàn thành
      </h2>
      <span class="font-label-xs text-label-xs text-outline">
        {{ completedCount }} việc
      </span>
    </div>

    <!-- Danh sách items hoàn thành: gạch ngang, opacity 60% -->
    <div class="space-y-0.5 opacity-60 hover:opacity-90 transition-opacity">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="group flex items-start justify-between py-2.5 px-space-sm rounded-lg hover:bg-surface-container-low transition-colors"
      >
        <!-- Nút tick đen + Nội dung gạch ngang -->
        <div class="flex items-start gap-space-md min-w-0 flex-1">
          <button
            @click="emit('toggle', todo.id)"
            class="mt-1 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0"
            title="Đánh dấu chưa hoàn thành"
          >
            <span class="material-symbols-outlined text-[12px]">check</span>
          </button>

          <div class="flex flex-col min-w-0 flex-1 pr-2">
            <span class="font-body-md text-body-md text-on-surface-variant line-through truncate">
              {{ todo.title }}
            </span>
            <p
              v-if="todo.description"
              class="font-body-sm text-body-sm text-outline line-through line-clamp-1 mt-0.5"
            >
              {{ todo.description }}
            </p>
          </div>
        </div>

        <!-- Giờ / Ngày hoàn thành + Nút xóa -->
        <div class="flex items-center gap-2.5 text-on-surface-variant font-label-xs text-label-xs flex-shrink-0 pt-0.5">
          <!-- Hashtag độ ưu tiên Minimalist (thuần text không nền) -->
          <span
            v-if="getPriorityBadge(todo.priority)"
            :class="getPriorityBadge(todo.priority)?.class"
            class="text-[12px] tracking-tight select-none"
          >
            {{ getPriorityBadge(todo.priority)?.label }}
          </span>

          <span v-if="todo.updatedAt || todo.createdAt">
            {{ formatTime(todo.updatedAt || todo.createdAt) }}
          </span>

          <button
            @click="emit('delete', todo.id)"
            class="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-opacity rounded"
            title="Xóa công việc"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>