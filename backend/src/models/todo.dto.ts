import { z } from "zod";

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
});
export type CreateTodoDTO = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
  completed: z.boolean().optional(),
});
export type UpdateTodoDTO = z.infer<typeof UpdateTodoSchema>;