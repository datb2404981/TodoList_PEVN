<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import TodoCurrentList from '@/components/TodoCurrentList.vue';
import TodoCompletedList from '@/components/TodoCompletedList.vue';
import TodoModal from '@/components/TodoModal.vue';
import { todoService } from '@/service/todoServices';
import type { Todo } from '@/stores/todo';

const todos = ref<Todo[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const isCreateModalOpen = ref(false);

const fetchTodos = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    todos.value = await todoService.getTodos();
  } catch (err) {
    console.error('Lỗi khi tải danh sách todo:', err);
    errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

const currentTodos = computed(() => todos.value.filter((t) => !t.completed));
const completedTodos = computed(() => todos.value.filter((t) => t.completed));

const handleToggle = async (id: number) => {
  try {
    await todoService.toggleStatus(id);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
  }
};

const handleDelete = async (id: number) => {
  try {
    await todoService.deleteTodo(id);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi xoá công việc:', err);
  }
};

const handleUpdate = async (todoData: Partial<Todo> & { id: number }) => {
  try {
    await todoService.updateTodo(todoData);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi khi cập nhật công việc:', err);
  }
};

const handleCreate = async (newTodoData: Partial<Todo>) => {
  try {
    await todoService.createTodo({
      title: newTodoData.title || '',
      description: newTodoData.description,
      priority: newTodoData.priority,
      dueDate: newTodoData.dueDate,
      completed: false,
    });
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi khi tạo nhiệm vụ mới:', err);
  }
};

onMounted(fetchTodos);
</script>

<template>
  <main class="relative min-h-screen bg-surface-container-lowest">
    <div class="w-full max-w-3xl mx-auto px-space-xl py-12">
      <div class="flex flex-col w-full">
        <Header @create="isCreateModalOpen = true" />

        <div v-if="isLoading" class="py-8 text-center text-on-surface-variant text-body-md">
          Đang tải danh sách công việc...
        </div>

        <div v-else-if="errorMessage" class="py-3 px-4 mb-4 rounded-lg bg-error-container text-error text-body-md">
          {{ errorMessage }}
        </div>

        <div v-else class="space-y-space-xl">
          <TodoCurrentList
            :todos="currentTodos"
            @toggle="handleToggle"
            @delete="handleDelete"
            @update="handleUpdate"
          />
          <TodoCompletedList
            :todos="completedTodos"
            @toggle="handleToggle"
            @delete="handleDelete"
          />
        </div>

        <!-- Modal Tạo nhiệm vụ mới -->
        <TodoModal
          :isOpen="isCreateModalOpen"
          :todo="null"
          @close="isCreateModalOpen = false"
          @save="handleCreate"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
@layer base {

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    overscroll-behavior: none;
  }

  main> :first-child {
    margin-top: 0 !important;
  }

  main> :last-child {
    margin-bottom: 0 !important;
  }
}

::-webkit-scrollbar {
  display: none;
}
</style>