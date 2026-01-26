import express from "express";
import * as postController from "./post.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { ownershipMiddleware } from "../middlewares/ownership.middleware.js";
const router = express.Router();

// ----------------------
// PUBLIC ENDPOINTS
// ----------------------

// List posts (pagination + optional tag filter)
router.get("/", postController.list);

// Get single post by slug
router.get("/:slug", postController.get);

// ----------------------
// AUTHENTICATED ENDPOINTS
// ----------------------

// Create a new post
router.post("/", requireAuth, postController.create);

// Update a post (ownership check)
router.patch("/:id", requireAuth, ownershipMiddleware(), postController.update);
// LIKES
router.post("/:id/like", requireAuth, postController.like);
router.delete("/:id/like", requireAuth, postController.unlike);

// COMMENTS
router.post("/:id/comments", requireAuth, postController.addComment);
router.delete(
  "/:id/comments/:commentId",
  requireAuth,
  postController.deleteComment,
);
router.get("/:id/comments", postController.getComments);

// Delete a post (ownership check)
router.delete(
  "/:id",
  requireAuth,
  ownershipMiddleware(),
  postController.remove,
);

export default router;
