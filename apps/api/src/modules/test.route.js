import { Router } from "express";

const router = Router();

// Test endpoint to verify server is working
router.get("/test", (req, res) => {
  res.json({ message: "Server is working properly!" });
});

export default router;