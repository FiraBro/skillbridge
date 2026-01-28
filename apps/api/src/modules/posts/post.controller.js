import * as postService from "./post.service.js";
import { createPostSchema, updatePostSchema } from "./post.schema.js";
import ApiError from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";

// ---------------------- POSTS ----------------------
export const create = catchAsync(async (req, res) => {
  const data = createPostSchema.parse(req.body);
  const post = await postService.createPost(data, req.user.id);
  res.status(201).json(post);
});

export const list = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const tag = req.query.tag;

  const posts = await postService.listPosts({
    page,
    limit,
    tag,
    userId: req.user?.id,
  });
  res.json(posts);
});

export const get = catchAsync(async (req, res) => {
  const post = await postService.getPost(req.params.slug, req.user?.id);
  res.json(post);
});

export const update = catchAsync(async (req, res) => {
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
});

export const remove = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.id, req.user.id, req.user.role);
  res.json({ status: "success", message: "Post deleted" });
});

// ---------------------- LIKES ----------------------
export const like = catchAsync(async (req, res) => {
  const data = await postService.likePost(req.params.id, req.user.id);
  res.json(data);
});

export const unlike = catchAsync(async (req, res) => {
  const data = await postService.unlikePost(req.params.id, req.user.id);
  res.json(data);
});

// ---------------------- COMMENTS ----------------------
export const addComment = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "Comment text is required");
  const comment = await postService.addComment(
    req.params.id,
    req.user.id,
    text,
  );
  res.status(201).json(comment);
});

export const deleteComment = catchAsync(async (req, res) => {
  const comment = await postService.deleteComment(
    req.params.commentId,
    req.user.id,
    req.user.role,
  );
  res.json({ status: "success", comment });
});

export const getComments = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const comments = await postService.getComments(req.params.id, {
    page,
    limit,
  });
  res.json(comments);
});
