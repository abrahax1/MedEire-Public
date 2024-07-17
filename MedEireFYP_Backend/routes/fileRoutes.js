import express from "express";
const router = express.Router();

import {
  S3_ViewFolders,
  S3_uploadFiles,
} from "../controllers/filesController.js";
import checkAuth from "../middleware/checkAuth.js";
import multer from "multer";
const upload = multer();

router.get("/:email", checkAuth, S3_ViewFolders); // view files
router.post("/upload:email", checkAuth, upload.single("file"), S3_uploadFiles); // upload files

export default router;
