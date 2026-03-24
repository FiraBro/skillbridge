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
  console.log('=== DEBUG: Incoming Username ===');
  console.log('req.params.username:', req.params.username);
  console.log('Type:', typeof req.params.username);
  console.log('Length:', req.params.username?.length);
  console.log('Hex:', Buffer.from(req.params.username || '', 'utf8').toString('hex'));
  const profile = await service.getPublicProfile(req.params.username);
  res.json(profile);
});

export const sync = catchAsync(async (req, res) => {
  const profile = await service.getPublicProfile(req.body.username);
  await service.syncGithub(profile);
  res.json({ success: true });
});
