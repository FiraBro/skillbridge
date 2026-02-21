import express from "express";
import * as postController from "./post.controller.js";
import {
  requireAuth,
  optionalAuth,
  authorize,
} from "../middlewares/auth.middleware.js";
import { ownershipMiddleware } from "../middlewares/ownership.middleware.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

// ----------------------
// PUBLIC ENDPOINTS
// ----------------------

// List posts (pagination + optional tag filter)
router.get("/", postController.list);

// Get single post by slug
router.get("/:slug", optionalAuth, postController.get);

// Share a post
router.post("/:id/share", postController.share);
router.post("/:id/follow", requireAuth, postController.toggleFollowUser);

// ----------------------
// AUTHENTICATED ENDPOINTS
// ----------------------

// Create a new post
router.post(
  "/",
  requireAuth,
  authorize("developer"),
  upload.single("cover_image"),
  postController.create,
);

// Update a post (ownership check)
router.patch(
  "/:id",
  requireAuth,
  authorize("developer"),
  ownershipMiddleware(),
  postController.update,
);
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
