import * as service from "./profile.service.js";
import catchAsync from "../utils/catchAsync.js";

export const create = catchAsync(async (req, res) => {
  const profile = await service.createProfile({
    userId: req.user.id,
    ...req.body,
  });
  res.status(201).json(profile);
});

export const get = catchAsync(async (req, res) => {
  const profile = await service.getPublicProfile(req.params.username);
  res.json(profile);
});

export const sync = catchAsync(async (req, res) => {
  const profile = await service.getPublicProfile(req.body.username);
  await service.syncGithub(profile);
  res.json({ success: true });
});
