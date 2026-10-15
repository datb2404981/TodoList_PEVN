import prisma from "../models/prisma";
import { CreateTodoDTO, UpdateTodoDTO } from "../models/todo.dto";
import { Todo } from "@prisma/client";

const create = async (todo: CreateTodoDTO): Promise<Todo> => {
  const existingTodo = await prisma.todo.findFirst({
    where: { title: todo.title },
  });

  if (existingTodo) {
    throw new Error("Todo already exists");
  }

  const newTodo = await prisma.todo.create({
    data: {
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate,
    },
  });

  return newTodo;
};

interface TodoFilter {
  completed?: boolean;
  search?: string;
}

const findAll = async (filter?: TodoFilter): Promise<Todo[]> => {
  return await prisma.todo.findMany({
    where: {
      completed: filter?.completed,
      title: filter?.search ?{contains: filter.search, mode:'insensitive'}: undefined
    }, orderBy:{createdAt:'desc'}
  });
};
const findById = async (id: number): Promise<Todo> => {
  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  if (!todo) {
    throw new Error("Todo not found");
  }

  return todo;
};

const update = async (id: number, todo: UpdateTodoDTO): Promise<Todo> => {
  await findById(id);
  return await prisma.todo.update({ where: { id }, data: { ...todo } });
};
const deleteOne = async (id: number): Promise<void> => {
  await findById(id);
  await prisma.todo.delete({ where: { id } });
};

const toggleStatues = async (id: number): Promise<Todo> => {
  const todo = await findById(id);
  return await prisma.todo.update({
    where: { id },
    data:{completed: !todo.completed},
  })
};

const clearCompleted = async():Promise<{count:number}> => {
  return await prisma.todo.deleteMany({
    where:{ completed:true},
  })
};



export { create, update, findAll, findById, deleteOne, clearCompleted,toggleStatues };
