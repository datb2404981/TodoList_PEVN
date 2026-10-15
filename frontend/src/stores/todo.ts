export interface Todo{
  id: number,
  title: string,
  description?: string,
  priority?: Priority,
  dueDate?: string | Date,
  completed: boolean,
  createdAt?: string | Date,
  updatedAt?: string |Date,
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type TodoFilter = {
  completed?: boolean;
  search?: string;
}
