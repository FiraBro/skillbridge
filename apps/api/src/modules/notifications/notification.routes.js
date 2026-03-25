// import { Router } from "express";
// import * as notificationController from "./notification.controller.js";
// import { requireAuth } from "../middlewares/auth.middleware.js";

// const router = Router();
// router.use(requireAuth);
// // Get all notifications
// router.get("/", notificationController.getNotifications);

// // Send contact request
// router.post("/contact", notificationController.sendRequest);

// // Respond to contact request (Accept/Ignore)
// router.patch("/contact/:id", notificationController.respondToRequest);

// export default router;

import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Ensure all notification/chat routes require login
router.use(requireAuth);

/**
 * 1. GENERAL NOTIFICATIONS
 * Shows profile views and system alerts
 */
router.get("/", notificationController.getNotifications);

/**
 * 2. CHAT & MESSAGING (The "Two-Way" logic)
 */

// GET /api/notifications/inbox - List of all active chats
router.get("/inbox", notificationController.getInbox);

// GET /api/notifications/chat/:partnerId - Full history between two people
router.get("/chat/:partnerId", notificationController.getChatHistory);

// POST /api/notifications/message - Send or Reply to a message
// This replaces the one-way "contact" logic
router.post("/message", notificationController.postMessage);

/**
 * 3. LEGACY / REQUEST MANAGEMENT (Optional)
 * You can keep these if you still want a formal "Accept/Ignore"
 * step before the chat becomes active.
 */
router.patch("/contact/:id", notificationController.respondToRequest);

export default router;
