import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createPost, getAllPosts, toggleLike, addComment } from "../controllers/communityController.js";

const router = express.Router();

router.post("/create", userAuth, createPost);
router.get("/all", userAuth, getAllPosts);
router.post("/:id/like", userAuth, toggleLike);
router.post("/:id/comment", userAuth, addComment);

export default router;
