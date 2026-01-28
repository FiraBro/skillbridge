import { Router } from "express";
import * as notificationController from "./notification.controller.js";

const router = Router();

// Get all notifications
router.get("/", notificationController.getNotifications);

// Send contact request
router.post("/contact", notificationController.sendRequest);

// Respond to contact request (Accept/Ignore)
router.patch("/contact/:id", notificationController.respondToRequest);

export default router;
