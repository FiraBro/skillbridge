import * as postService from "./post.service.js";
import { createPostSchema, updatePostSchema } from "./post.schema.js";

// CREATE POST
export async function create(req, res, next) {
  try {
    const data = createPostSchema.parse(req.body);
    const post = await postService.createPost(data, req.user.id);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

// LIST POSTS (pagination + optional tag filter)
export async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const tag = req.query.tag;

    const posts = await postService.listPosts({ page, limit, tag });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// GET SINGLE POST
export async function get(req, res, next) {
  try {
    const post = await postService.getPost(req.params.slug);
    if (!post)
      return res
        .status(404)
        .json({ status: "error", message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

// UPDATE POST
export async function update(req, res, next) {
  try {
    const data = updatePostSchema.parse(req.body);
    await postService.updatePost(req.params.id, data);
    res.json({ status: "success", message: "Post updated" });
  } catch (err) {
    next(err);
  }
}
// ------------------ LIKES ------------------
export async function like(req, res, next) {
  try {
    const data = await postService.likePost(req.params.id, req.user.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function unlike(req, res, next) {
  try {
    const data = await postService.unlikePost(req.params.id, req.user.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// ------------------ COMMENTS ------------------
export async function addComment(req, res, next) {
  try {
    const { text } = req.body;
    const comment = await postService.addComment(
      req.params.id,
      req.user.id,
      text,
    );
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const comment = await postService.deleteComment(
      req.params.commentId,
      req.user.id,
    );
    res.status(200).json({ status: "success", comment });
  } catch (err) {
    next(err);
  }
}

export async function getComments(req, res, next) {
  try {
    const comments = await postService.getComments(req.params.id);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
}

// DELETE POST
export async function remove(req, res, next) {
  try {
    await postService.deletePost(req.params.id);
    res.json({ status: "success", message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}
