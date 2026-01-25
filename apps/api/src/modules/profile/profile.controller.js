import * as service from "./profile.service.js";

export async function create(req, res) {
  const profile = await service.createProfile({
    userId: req.user.id,
    ...req.body,
  });
  res.status(201).json(profile);
}

export async function get(req, res) {
  const profile = await service.getPublicProfile(req.params.username);
  res.json(profile);
}

export async function sync(req, res) {
  const profile = await service.getPublicProfile(req.body.username);
  await service.syncGithub(profile);
  res.json({ success: true });
}
