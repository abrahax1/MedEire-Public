import express from "express";
const router = express.Router();

import { getAllTasks } from "../controllers/taskController.js";
import checkAuth from "../middleware/checkAuth.js";

// router.post("/", checkAuth, task) // creates tasks
router.get("/", checkAuth, getAllTasks); // view tasks
router.delete("/:id", checkAuth); // delete tasks

export default router;
