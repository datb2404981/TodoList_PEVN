import express from "express";
import cors from "cors";
import todoRouter from "./routers/todo.routers";

const app = express();

app.use(cors());
app.use(express.json());
app.use('/todos',todoRouter)

export default app;