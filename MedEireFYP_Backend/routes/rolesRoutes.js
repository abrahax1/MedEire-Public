import express from "express";
const router = express.Router();

import {
  getUsersAndRoles,
  addRoles,
  deleteRoles,
} from "../controllers/rolesController.js";
import checkAuth from "../middleware/checkAuth.js";

router.get("/user_roles", getUsersAndRoles); // gets users and the roles that can be attached
router.post("/add_roles", checkAuth, addRoles); // adds roles to user
router.delete("/delete_roles", checkAuth, deleteRoles); // adds roles to user

export default router;
