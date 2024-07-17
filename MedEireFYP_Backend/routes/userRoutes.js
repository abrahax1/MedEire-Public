import express from "express";
const router = express.Router();

import {
  register,
  login,
  confirm,
  forgot,
  retrieve,
  newPassword,
  profile,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import checkAuth from "../middleware/checkAuth.js";

// Registration, authentication and confirmation of users
router.post("/", register); // create new user
router.post("/login", login); // authenticates user
router.get("/confirm/:token", confirm); // confirms user
router.post("/forgot-password", forgot); // creates new token and email for user
router.route("/forgot-password/:token").get(retrieve).post(newPassword); // updates Password

router.get("/profile", checkAuth, profile); // authentication of user
router.put("/update/:id", checkAuth, updateUser); // update user data
router.delete("/delete/:id", checkAuth, deleteUser); // delete user

export default router;
