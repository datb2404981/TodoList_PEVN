<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Todo } from '@/stores/todo';
import { Priority } from '@/stores/todo';

const props = withDefaults(
  defineProps<{
    todo?: Todo | null;
    isOpen: boolean;
  }>(),
  {
    todo: null,
    isOpen: false,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: Partial<Todo> & { id?: number }): void;
}>();

const title = ref('');
const description = ref('');
const priority = ref<Priority>(Priority.MEDIUM);
const dueDate = ref<string>(''); // YYYY-MM-DD format
const titleInputRef = ref<HTMLInputElement | null>(null);

// Popover states
const isDatePickerOpen = ref(false);
const isPriorityOpen = ref(false);

// Calendar navigation state
const calendarYear = ref(new Date().getFullYear());
const calendarMonth = ref(new Date().getMonth()); // 0-11

const toInputDateFormat = (d?: string | Date | null): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Khởi tạo hoặc cập nhật form khi props.todo thay đổi
watch(
  () => props.todo,
  (newTodo) => {
    if (newTodo) {
      title.value = newTodo.title || '';
      description.value = newTodo.description || '';
      priority.value = (newTodo.priority as Priority) || Priority.MEDIUM;
      dueDate.value = toInputDateFormat(newTodo.dueDate);
    } else {
      title.value = '';
      description.value = '';
      priority.value = Priority.MEDIUM;
      dueDate.value = '';
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      isDatePickerOpen.value = false;
      isPriorityOpen.value = false;
      if (dueDate.value) {
        const parts = dueDate.value.split('-');
        if (parts[0] && parts[1]) {
          calendarYear.value = parseInt(parts[0], 10);
          calendarMonth.value = parseInt(parts[1], 10) - 1;
        }
      } else {
        const now = new Date();
        calendarYear.value = now.getFullYear();
        calendarMonth.value = now.getMonth();
      }
      setTimeout(() => {
        titleInputRef.value?.focus();
      }, 50);
    }
  }
);

const isEditing = computed(() => !!props.todo?.id);

// Hiển thị text ngày ngắn gọn cho badge
const displayDateLabel = computed(() => {
  if (!dueDate.value) return '';
  const [y, m, d] = dueDate.value.split('-');
  if (!y || !m || !d) return '';
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  if (isNaN(date.getTime())) return '';
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Hôm nay';

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
});

// Priority helpers
const priorityInfo = computed(() => {
  switch (priority.value) {
    case Priority.HIGH:
      return {
        label: 'Cao',
        colorClass: 'text-rose-500',
        borderClass: 'border-rose-200 hover:bg-rose-50/50',
      };
    case Priority.LOW:
      return {
        label: 'Thấp',
        colorClass: 'text-neutral-500',
        borderClass: 'border-neutral-200 hover:bg-neutral-50',
      };
    case Priority.MEDIUM:
    default:
      return {
        label: 'Trung bình',
        colorClass: 'text-amber-600',
        borderClass: 'border-amber-200 hover:bg-amber-50/50',
      };
  }
});

const selectPriority = (p: Priority) => {
  priority.value = p;
  isPriorityOpen.value = false;
};

// Calendar calculations
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const monthName = computed(() => {
  return `Tháng ${calendarMonth.value + 1}, ${calendarYear.value}`;
});

const prevMonth = () => {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;
    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
};

const nextMonth = () => {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;
    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
};

interface CalendarCell {
  date: number;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const calendarDays = computed(() => {
  const cells: CalendarCell[] = [];
  const year = calendarYear.value;
  const month = calendarMonth.value;

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = toInputDateFormat(new Date());

  // Ngày tháng trước
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateString = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      date: d,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === dueDate.value,
    });
  }

  // Ngày tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      date: d,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      isSelected: dateString === dueDate.value,
    });
  }

  // Ngày tháng sau cho đủ bội số của 7
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateString = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      date: d,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === dueDate.value,
    });
  }

  return cells;
});

const selectDate = (dateStr: string) => {
  dueDate.value = dateStr;
  isDatePickerOpen.value = false;
};

const setQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek' | 'clear') => {
  const now = new Date();
  if (type === 'today') {
    dueDate.value = toInputDateFormat(now);
  } else if (type === 'tomorrow') {
    now.setDate(now.getDate() + 1);
    dueDate.value = toInputDateFormat(now);
  } else if (type === 'nextWeek') {
    now.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
    dueDate.value = toInputDateFormat(now);
  } else if (type === 'clear') {
    dueDate.value = '';
  }
  isDatePickerOpen.value = false;
};

const handleSave = () => {
  if (!title.value.trim()) return;

  const payload: Partial<Todo> & { id?: number } = {
    title: title.value.trim(),
    description: description.value.trim() || (null as any),
    priority: priority.value,
    dueDate: dueDate.value ? new Date(`${dueDate.value}T00:00:00.000Z`).toISOString() : (null as any),
  };

  if (props.todo?.id) {
    payload.id = props.todo.id;
  }

  emit('save', payload);
  emit('close');
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isDatePickerOpen.value) {
      isDatePickerOpen.value = false;
      return;
    }
    if (isPriorityOpen.value) {
      isPriorityOpen.value = false;
      return;
    }
    emit('close');
  }
};

const closeAllPopovers = () => {
  isDatePickerOpen.value = false;
  isPriorityOpen.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs transition-opacity"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg bg-white rounded-2xl border border-neutral-200/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] p-6 relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
        @click="closeAllPopovers"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-1">
          <div class="flex items-center gap-2 text-neutral-400 font-label-xs text-label-xs uppercase tracking-wider">
            <span class="material-symbols-outlined text-[15px]">
              {{ isEditing ? 'edit' : 'add_task' }}
            </span>
            <span class="font-medium text-neutral-500 text-[11px]">{{ isEditing ? 'Chỉnh sửa nhiệm vụ' : 'Thêm nhiệm vụ mới' }}</span>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Đóng"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Input Title -->
        <div>
          <input
            ref="titleInputRef"
            v-model="title"
            @keydown.enter.prevent="handleSave"
            class="w-full bg-transparent text-xl font-semibold text-neutral-900 placeholder:text-neutral-300 outline-none tracking-tight"
            placeholder="Tên nhiệm vụ..."
            type="text"
          />
        </div>

        <!-- Input Description -->
        <div>
          <textarea
            v-model="description"
            class="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-300 outline-none resize-none min-h-[72px] leading-relaxed"
            placeholder="Thêm ghi chú, mô tả chi tiết..."
          ></textarea>
        </div>

        <!-- Attributes Bar -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 relative">
          <!-- Custom Date Picker Dropdown Button -->
          <div class="relative" @click.stop>
            <button
              type="button"
              @click="isDatePickerOpen = !isDatePickerOpen; isPriorityOpen = false"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600 text-xs font-normal transition-colors cursor-pointer"
              :class="{ 'bg-neutral-100/70 border-neutral-300': isDatePickerOpen }"
            >
              <span class="material-symbols-outlined text-[15px] text-neutral-400">calendar_today</span>
              <span>{{ displayDateLabel || 'Hạn chót' }}</span>
              <span
                v-if="dueDate"
                @click.stop="setQuickDate('clear')"
                class="ml-0.5 p-0.5 hover:text-rose-500 text-neutral-400 rounded transition-colors"
                title="Xóa hạn chót"
              >
                <span class="material-symbols-outlined text-[13px] block">close</span>
              </span>
            </button>

            <!-- Custom Modern Calendar Popover -->
            <div
              v-if="isDatePickerOpen"
              class="absolute left-0 top-full mt-2 z-50 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-[0_16px_40px_-6px_rgba(0,0,0,0.1)] p-3 animate-in fade-in zoom-in-95 duration-100 select-none"
            >
              <!-- Quick shortcuts -->
              <div class="grid grid-cols-3 gap-1 pb-2 border-b border-neutral-100 text-[11px]">
                <button
                  type="button"
                  @click="setQuickDate('today')"
                  class="py-1 px-1.5 rounded-md hover:bg-neutral-100 text-center font-medium text-neutral-700 transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  @click="setQuickDate('tomorrow')"
                  class="py-1 px-1.5 rounded-md hover:bg-neutral-100 text-center font-medium text-neutral-700 transition-colors"
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  @click="setQuickDate('nextWeek')"
                  class="py-1 px-1.5 rounded-md hover:bg-neutral-100 text-center font-medium text-neutral-700 transition-colors"
                >
                  Tuần sau
                </button>
              </div>

              <!-- Month header & navigation -->
              <div class="flex items-center justify-between py-2 px-1">
                <span class="text-xs font-semibold text-neutral-800">{{ monthName }}</span>
                <div class="flex items-center gap-0.5">
                  <button
                    type="button"
                    @click="prevMonth"
                    class="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[15px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    @click="nextMonth"
                    class="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[15px]">chevron_right</span>
                  </button>
                </div>
              </div>

              <!-- Day of week header -->
              <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 mb-1">
                <span v-for="w in weekDays" :key="w" class="py-0.5">{{ w }}</span>
              </div>

              <!-- Days grid -->
              <div class="grid grid-cols-7 gap-1 text-center">
                <button
                  v-for="cell in calendarDays"
                  :key="cell.dateString"
                  type="button"
                  @click="selectDate(cell.dateString)"
                  class="w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-xs transition-colors"
                  :class="{
                    'bg-neutral-900 text-white font-medium shadow-2xs': cell.isSelected,
                    'border border-neutral-900 text-neutral-900 font-medium hover:bg-neutral-100': cell.isToday && !cell.isSelected,
                    'text-neutral-700 hover:bg-neutral-100': cell.isCurrentMonth && !cell.isSelected && !cell.isToday,
                    'text-neutral-300 hover:bg-neutral-50': !cell.isCurrentMonth && !cell.isSelected,
                  }"
                >
                  {{ cell.date }}
                </button>
              </div>

              <!-- Clear button -->
              <div v-if="dueDate" class="pt-2 mt-2 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  @click="setQuickDate('clear')"
                  class="text-[11px] text-rose-500 hover:underline font-medium cursor-pointer"
                >
                  Bỏ chọn ngày
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Priority Dropdown Button -->
          <div class="relative" @click.stop>
            <button
              type="button"
              @click="isPriorityOpen = !isPriorityOpen; isDatePickerOpen = false"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-normal transition-colors cursor-pointer"
              :class="[priorityInfo.borderClass, priorityInfo.colorClass]"
            >
              <span class="material-symbols-outlined text-[14px]" :class="priorityInfo.colorClass">flag</span>
              <span class="font-medium">{{ priorityInfo.label }}</span>
              <span class="material-symbols-outlined text-[13px] text-neutral-400 ml-0.5">expand_more</span>
            </button>

            <!-- Priority Dropdown Menu -->
            <div
              v-if="isPriorityOpen"
              class="absolute left-0 top-full mt-2 z-50 w-40 bg-white/95 backdrop-blur-md rounded-xl border border-neutral-200/80 shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] p-1 animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
            >
              <button
                type="button"
                @click="selectPriority(Priority.HIGH)"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[15px] text-rose-500">flag</span>
                  <span class="text-rose-500 font-medium">Cao</span>
                </div>
                <span v-if="priority === Priority.HIGH" class="material-symbols-outlined text-[15px] text-rose-500">check</span>
              </button>

              <button
                type="button"
                @click="selectPriority(Priority.MEDIUM)"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[15px] text-amber-600">flag</span>
                  <span class="text-amber-700 font-medium">Trung bình</span>
                </div>
                <span v-if="priority === Priority.MEDIUM" class="material-symbols-outlined text-[15px] text-amber-600">check</span>
              </button>

              <button
                type="button"
                @click="selectPriority(Priority.LOW)"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[15px] text-neutral-400">flag</span>
                  <span class="text-neutral-700 font-medium">Thấp</span>
                </div>
                <span v-if="priority === Priority.LOW" class="material-symbols-outlined text-[15px] text-neutral-700">check</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span class="text-[11px] text-neutral-400">
            Nhấn
            <kbd class="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px] text-neutral-600">Enter ↵</kbd>
            để lưu
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              @click="handleSave"
              :disabled="!title.trim()"
              class="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-black transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <span>{{ isEditing ? 'Lưu thay đổi' : 'Tạo nhiệm vụ' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
</style>
