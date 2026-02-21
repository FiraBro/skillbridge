import * as postService from "./post.service.js";
import { createPostSchema, updatePostSchema } from "./post.schema.js";
import ApiError from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { trackView } from "./post.view.js";

export const create = catchAsync(async (req, res) => {
  // 1. Parse tags if sent as string
  if (typeof req.body.tags === "string") {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (e) {
      req.body.tags = [];
    }
  }

  // 2. Validate request body (without cover_image)
  const data = createPostSchema.parse({
    ...req.body,
    cover_image: undefined, // temporarily undefined for validation
  });

  // 3. Extract cover image path from Multer
  const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

  // 4. Create post
  const post = await postService.createPost(
    { ...data, cover_image }, // now add cover_image as string
    req.user.id,
  );

  res.status(201).json(post);
});

// export const list = catchAsync(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const tag = req.query.tag;
//   const authorId = req.query.authorId;

//   // 1. ✅ Extract the sortBy parameter from the URL query
//   const sortBy = req.query.sortBy;

//   const posts = await postService.listPosts({
//     page,
//     limit,
//     tag,
//     authorId,
//     sortBy, // 2. ✅ Pass it to the service!
//     userId: req.user?.id,
//   });

//   res.json(posts);
// });
export const list = catchAsync(async (req, res) => {
  const { page, limit, tag, authorId, sortBy } = req.query;

  const posts = await postService.listPosts({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    tag,
    authorId,
    sortBy: sortBy || "relevant", // Default to relevant
    userId: req.user?.id,
  });

  res.json(posts);
});

export const toggleFollowUser = catchAsync(async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.id;

  if (!followingId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const result = await postService.toggleFollow(followerId, followingId);

  // FIX: Return the property name the frontend expects
  res.status(200).json({
    status: "success",
    is_following_author: result.following, // Map 'following' to 'is_following_author'
    authorId: followingId,
  });
});

export const toggleFollow = catchAsync(async (req, res) => {
  const { followingId } = req.body;
  const followerId = req.user.id;

  const result = await userService.toggleFollow(followerId, followingId);
  res.json(result);
});

export const get = catchAsync(async (req, res) => {
  // 1. Fetch the post data from the service
  const post = await postService.getPost(req.params.slug, req.user?.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // 2. Track the view (Real-world "Background" execution)
  // We don't 'await' this so the user gets their data instantly.
  // The trackView logic handles the Author check and Redis uniqueness.
  trackView(req, post.id, post.author_id).catch((err) => {
    console.error("View Tracking Error:", err);
  });

  // 3. Return the post to the React frontend
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

export const share = catchAsync(async (req, res) => {
  const data = await postService.sharePost(req.params.id);
  res.json(data);
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
