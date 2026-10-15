import { Request, Response } from 'express';
import * as todoService from '../services/todo.services';
import { CreateTodoSchema, UpdateTodoSchema } from '../models/todo.dto';
import { assert } from 'console';
import { PropertyAccessEntityNameExpression } from 'typescript';
import { success } from 'zod';

const create = async (req:Request, res:Response) => {
  try {
    const todo = CreateTodoSchema.safeParse(req.body)
    if (!todo.success) {
      throw new Error(`${todo.error.format()}`);
    }
    const result = await todoService.create(todo.data)
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success:false,
      message: error.message || "Failed to create todo"
    });
  }
};
const findAll = async (req: Request, res: Response) => {
  try {
    const { completed, search } = req.query;
    const filter = {
      completed: completed !== undefined ? completed === "true" : undefined,
      search: typeof search === "string" ? search : undefined
    }
    const result = await todoService.findAll(filter);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch todos",
    });
  }
};
const findOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await todoService.findById(id)
    return res.status(200).json(result);
  } catch (err:any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Todo not found",
    });
  }
};
const update = async (req: Request, res: Response) => {
  try {
    const validation = UpdateTodoSchema.safeParse(req.body);
    if (!validation.success) {
      throw new Error(`${validation.error}`)
    }
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new Error("Invalid todo ID")
    }
    const result = await todoService.update(id, validation.data)
    return res.status(200).json(result)
  } catch (err:any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update todo",
    });
  }
};

const toggleStatus = async (req:Request,res:Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new Error("Invalid todo ID");
    const result = await todoService.toggleStatues(id);
    return res.status(200).json(result);
  } catch (err:any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to toggle status",
    });
  }
}

const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new Error("Invalid todo ID");
    await todoService.deleteOne(id);
    return res.status(200).json({ message: `Todo deleted successfully` });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to delete todo",
    });
  }
};
const clearCompleted = async (req: Request, res: Response) => {
  try {
    await todoService.clearCompleted()
    return res.status(200).json({message: "Clear completed todos successfully"})
  } catch (err : any) {
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to clear completed todos",
      });
  }
};

const todoControler = {
  create,findAll,findOne,toggleStatus,update,deleteOne,clearCompleted
}

export default todoControler;