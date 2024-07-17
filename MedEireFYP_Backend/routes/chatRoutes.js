import express from "express";
const router = express.Router();

import { getChatByID, createChat } from "../controllers/chatController.js";
import checkAuth from "../middleware/checkAuth.js";

router.route("/:id")
    .get(checkAuth, getChatByID)
    .post(checkAuth, createChat);

// router.get("/:id", checkAuth, getChatByID); // view tasks
// router.post("/:id", checkAuth, createChat); // delete tasks

export default router;
