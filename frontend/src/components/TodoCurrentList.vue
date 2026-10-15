<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import type { Todo } from '@/stores/todo';
import TodoModal from './TodoModal.vue';

const props = withDefaults(
  defineProps<{
    todos?: Todo[];
  }>(),
  {
    todos: () => [],
  }
);

const emit = defineEmits<{
  (e: 'toggle', id: number): void;
  (e: 'delete', id: number): void;
  (e: 'update', todo: Partial<Todo> & { id: number }): void;
}>();

const todoCount = computed(() => props.todos.length);

// Inline edit title
const editingId = ref<number | null>(null);
const editingTitle = ref('');
const inlineInputRef = ref<HTMLInputElement | null>(null);

const startInlineEdit = (todo: Todo) => {
  editingId.value = todo.id;
  editingTitle.value = todo.title;
  nextTick(() => {
    inlineInputRef.value?.focus();
    inlineInputRef.value?.select();
  });
};

const cancelInlineEdit = () => {
  editingId.value = null;
  editingTitle.value = '';
};

const saveInlineTitle = (todo: Todo) => {
  if (editingId.value === null) return;
  const newTitle = editingTitle.value.trim();
  if (newTitle && newTitle !== todo.title) {
    emit('update', { id: todo.id, title: newTitle });
  }
  editingId.value = null;
};

// Context Menu (Menu chuột phải)
const contextMenu = ref<{
  visible: boolean;
  x: number;
  y: number;
  todo: Todo | null;
}>({
  visible: false,
  x: 0,
  y: 0,
  todo: null,
});

const openContextMenu = (e: MouseEvent, todo: Todo) => {
  e.preventDefault();
  const menuWidth = 160;
  const menuHeight = 90;
  const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
  const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

  contextMenu.value = {
    visible: true,
    x,
    y,
    todo,
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

// Edit Modal
const isModalOpen = ref(false);
const selectedTodoForModal = ref<Todo | null>(null);

const handleEditFromMenu = () => {
  if (contextMenu.value.todo) {
    selectedTodoForModal.value = contextMenu.value.todo;
    isModalOpen.value = true;
  }
  closeContextMenu();
};

const handleDeleteFromMenu = () => {
  if (contextMenu.value.todo) {
    emit('delete', contextMenu.value.todo.id);
  }
  closeContextMenu();
};

const handleSaveModal = (data: Partial<Todo> & { id?: number }) => {
  if (data.id) {
    emit('update', data as Partial<Todo> & { id: number });
  }
};

// Format hiển thị ngày giờ ngắn gọn, tinh tế
const formatDueDate = (dateStr?: string | Date | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();

  // Kiểm tra cùng ngày
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Ngày mai
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  ) {
    return 'Ngày mai';
  }

  return `${date.getDate()} Th${date.getMonth() + 1}`;
};

const isUrgent = (todo: Todo) => {
  return todo.priority === 'HIGH';
};

const getPriorityBadge = (priority?: string) => {
  switch (priority) {
    case 'HIGH':
      return {
        label: '#cao',
        class: 'text-rose-500 font-medium',
      };
    case 'MEDIUM':
      return {
        label: '#trung-bình',
        class: 'text-amber-600 font-medium',
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

const handleGlobalClick = () => {
  closeContextMenu();
};

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeContextMenu();
    cancelInlineEdit();
  }
};

onMounted(() => {
  window.addEventListener('click', handleGlobalClick);
  window.addEventListener('scroll', closeContextMenu);
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
  window.removeEventListener('scroll', closeContextMenu);
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<template>
  <section v-if="todos.length > 0">
    <div class="flex items-center justify-between pb-space-sm mb-space-xs">
      <h2 class="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wider">
        Cần làm
      </h2>
      <span class="font-label-xs text-label-xs text-on-surface-variant">{{ todos.length }} việc</span>
    </div>

    <div class="space-y-0.5">
      <div
        v-for="todo in todos"
        :key="todo.id"
        @contextmenu.prevent="openContextMenu($event, todo)"
        class="group flex items-start justify-between py-2.5 px-space-sm rounded-lg hover:bg-surface-container-low transition-colors select-none"
      >
        <!-- Nút tròn tick + Title + Description -->
        <div class="flex items-start gap-space-md min-w-0 flex-1">
          <button
            @click.stop="emit('toggle', todo.id)"
            class="mt-1 w-4 h-4 rounded-full border border-outline hover:border-primary flex items-center justify-center transition-colors flex-shrink-0 group-hover:border-primary"
            title="Đánh dấu hoàn thành"
          ></button>

          <div class="flex flex-col min-w-0 flex-1 pr-2">
            <!-- Title: Inline edit khi nhấn vào -->
            <input
              v-if="editingId === todo.id"
              ref="inlineInputRef"
              v-model="editingTitle"
              @blur="saveInlineTitle(todo)"
              @keydown.enter.prevent="saveInlineTitle(todo)"
              @keydown.esc="cancelInlineEdit"
              @click.stop
              class="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none py-0 px-0 focus:outline-none focus:ring-0 border-none m-0 shadow-none"
            />
            <span
              v-else
              @click.stop="startInlineEdit(todo)"
              class="font-body-md text-body-md text-on-surface truncate cursor-text hover:text-primary transition-colors"
              title="Nhấn trực tiếp để sửa tiêu đề nhanh"
            >
              {{ todo.title }}
            </span>

            <!-- Description hiển thị ở đây -->
            <p
              v-if="todo.description"
              class="font-body-sm text-body-sm text-outline line-clamp-1 mt-0.5"
            >
              {{ todo.description }}
            </p>
          </div>
        </div>

        <!-- Bên phải: Hashtag độ ưu tiên + Due date + Action -->
        <div class="flex items-center gap-2.5 text-on-surface-variant font-label-xs text-label-xs flex-shrink-0 pt-0.5">
          <!-- Hashtag độ ưu tiên Minimalist (thuần text không viền không nền) -->
          <span
            v-if="getPriorityBadge(todo.priority)"
            :class="getPriorityBadge(todo.priority)?.class"
            class="text-[12px] tracking-tight select-none"
          >
            {{ getPriorityBadge(todo.priority)?.label }}
          </span>

          <span
            v-if="formatDueDate(todo.dueDate)"
            :class="[
              isUrgent(todo) ? 'text-rose-500 font-medium' : 'text-neutral-400'
            ]"
            class="text-[12px]"
          >
            {{ formatDueDate(todo.dueDate) }}
          </span>

          <button
            @click.stop="openContextMenu($event, todo)"
            class="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-all"
            title="Tùy chọn"
          >
            <span class="material-symbols-outlined text-[15px]">more_horiz</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Context Menu (Minimalist Linear/Apple style) -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
        class="fixed z-50 min-w-[120px] bg-white/95 backdrop-blur-md border border-neutral-200/60 rounded-lg shadow-md p-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
        @click.stop
      >
        <button
          @click="handleEditFromMenu"
          class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 transition-colors cursor-pointer group"
        >
          <span class="material-symbols-outlined text-[13px] text-neutral-400 group-hover:text-neutral-600 transition-colors">edit</span>
          <span class="font-normal text-[13px]">Sửa</span>
        </button>

        <div class="h-px bg-neutral-100/80 my-0.5 mx-1"></div>

        <button
          @click="handleDeleteFromMenu"
          class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-neutral-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer group"
        >
          <span class="material-symbols-outlined text-[13px] text-neutral-400 group-hover:text-rose-500 transition-colors">delete</span>
          <span class="font-normal text-[13px]">Xóa</span>
        </button>
      </div>
    </Teleport>

    <!-- Modal Popup Chỉnh sửa nhiệm vụ (theo mẫu pop up tạo todo list.html) -->
    <TodoModal
      :isOpen="isModalOpen"
      :todo="selectedTodoForModal"
      @close="isModalOpen = false"
      @save="handleSaveModal"
    />
  </section>
</template>

<style scoped>
</style>