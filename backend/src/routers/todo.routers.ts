import express from 'express';
import todoController from "../controllers/todo.controllers"

const router = express.Router();

router
  .route("/")
  .get(todoController.findAll)
  .post(todoController.create)
  .delete(todoController.clearCompleted);

router
  .route("/:id")
  .get(todoController.findOne)
  .put(todoController.update)
  .delete(todoController.deleteOne)

router.patch("/:id/toggle",todoController.toggleStatus)
export default router;