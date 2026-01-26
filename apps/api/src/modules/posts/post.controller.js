import * as postService from "./post.service.js";
import { createPostSchema, updatePostSchema } from "./post.schema.js";
import ApiError from "../utils/apiError.js";

const handleError = (res, err) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Internal server error",
  });
};

// ---------------------- POSTS ----------------------
export async function create(req, res) {
  try {
    const data = createPostSchema.parse(req.body);
    const post = await postService.createPost(data, req.user.id);
    res.status(201).json(post);
  } catch (err) {
    handleError(res, err);
  }
}

export async function list(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const tag = req.query.tag;

    const posts = await postService.listPosts({ page, limit, tag });
    res.json(posts);
  } catch (err) {
    handleError(res, err);
  }
}

export async function get(req, res) {
  try {
    const post = await postService.getPost(req.params.slug);
    res.json(post);
  } catch (err) {
    handleError(res, err);
  }
}

export async function update(req, res) {
  try {
    const data = updatePostSchema.parse(req.body);
    const clientUpdatedAt = req.body.updated_at; // Optional: for optimistic locking
    await postService.updatePost(
      req.params.id,
      data,
      req.user.id,
      req.user.role,
      clientUpdatedAt,
    );
    res.json({ status: "success", message: "Post updated" });
  } catch (err) {
    handleError(res, err);
  }
}

export async function remove(req, res) {
  try {
    await postService.deletePost(req.params.id, req.user.id, req.user.role);
    res.json({ status: "success", message: "Post deleted" });
  } catch (err) {
    handleError(res, err);
  }
}

// ---------------------- LIKES ----------------------
export async function like(req, res) {
  try {
    const data = await postService.likePost(req.params.id, req.user.id);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
}

export async function unlike(req, res) {
  try {
    const data = await postService.unlikePost(req.params.id, req.user.id);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
}

// ---------------------- COMMENTS ----------------------
export async function addComment(req, res) {
  try {
    const { text } = req.body;
    if (!text) throw new ApiError("Comment text is required", 400);
    const comment = await postService.addComment(
      req.params.id,
      req.user.id,
      text,
    );
    res.status(201).json(comment);
  } catch (err) {
    handleError(res, err);
  }
}

export async function deleteComment(req, res) {
  try {
    const comment = await postService.deleteComment(
      req.params.commentId,
      req.user.id,
      req.user.role,
    );
    res.json({ status: "success", comment });
  } catch (err) {
    handleError(res, err);
  }
}

export async function getComments(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const comments = await postService.getComments(req.params.id, {
      page,
      limit,
    });
    res.json(comments);
  } catch (err) {
    handleError(res, err);
  }
}
