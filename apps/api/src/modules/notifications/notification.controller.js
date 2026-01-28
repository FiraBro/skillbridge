import * as notificationService from "./notification.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * GET /api/notifications
 * Get current user's notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications =
      await notificationService.getUserNotifications(userId);
    return res.status(200).json(apiResponse.success(notifications));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/notifications/contact
 * Send a contact request
 */
export async function sendRequest(req, res, next) {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    const request = await notificationService.sendContactRequest(
      senderId,
      receiverId,
      message,
    );

    return res
      .status(201)
      .json(apiResponse.success(request, "Contact request sent"));
  } catch (error) {
    if (error.message === "Contact request already sent") {
      return res.status(400).json(apiResponse.error(error.message, 400));
    }
    next(error);
  }
}

/**
 * PATCH /api/notifications/contact/:id
 * Accept or Ignore a contact request
 */
export async function respondToRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const request = await notificationService.updateRequestStatus(
      id,
      userId,
      status,
    );
    return res
      .status(200)
      .json(apiResponse.success(request, `Request ${status}`));
  } catch (error) {
    if (error.message === "Request not found or unauthorized") {
      return res.status(404).json(apiResponse.error(error.message, 404));
    }
    next(error);
  }
}
