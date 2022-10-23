import express from "express";
import {
  createComment,
  createPost,
  deletePost,
  editPost,
  getCategories,
  getPopularPosts,
  getPost,
  getPosts,
  getPostsByCategory,
  getPostsBySearch,
  getUserPosts,
  likePost,
} from "../controllers/posts.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/popularPosts", getPopularPosts);
router.get("/:id/userPosts", getUserPosts);
router.get("/:id/search", getPostsBySearch);
router.post("/create", createPost);
router.get("/categories", getCategories);
router.get("/:id", getPost);
router.get("/:id/category", getPostsByCategory);
router.post("/:id/commentPost", createComment);
router.patch("/:id/likePost", likePost);
router.patch("/:id/editPost", editPost);
router.delete("/:id/deletePost", deletePost);

export default router;
