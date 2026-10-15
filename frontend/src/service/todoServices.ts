import type { Todo, TodoFilter } from "@/stores/todo";
import apiClient from "./api";

export const todoService = {
  async getTodos(params?: TodoFilter): Promise<Todo[]> {
    const response = await apiClient.get<Todo[]>("/", { params });
    return response.data;
  },
  async getTodo(id: number): Promise<Todo> {
    const response = await apiClient.get<Todo>(`/${id}`);
    return response.data;
  },
  async createTodo(newTodo: Omit<Todo, "id">): Promise<Todo> {
    const response = await apiClient.post<Todo>("/", newTodo);
    return response.data;
  },
  async updateTodo(todo: Partial<Todo> & { id: number }): Promise<Todo> {
    const response = await apiClient.put<Todo>(`/${todo.id}`, todo);
    return response.data;
  },
  async toggleStatus(id:number): Promise<Todo> {
    const response = await apiClient.patch<Todo>(`/${id}/toggle`);
    return response.data;
  },
  async deleteTodo(id:number): Promise<void> {
    await apiClient.delete(`/${id}`);
  },
  async clearCompletedTodos(): Promise<void>{
    await apiClient.delete("/");
  }
};