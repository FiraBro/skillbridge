import * as notificationService from "./notification.service.js";
import apiResponse from "../utils/apiResponse.js";

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

export async function getInbox(req, res, next) {
  try {
    const userId = req.user.id;
    const inbox = await notificationService.getUserInbox(userId);
    return res.status(200).json(apiResponse.success(inbox));
  } catch (error) {
    next(error);
  }
}

export async function getChatHistory(req, res, next) {
  try {
    const { partnerId } = req.params;
    const messages = await notificationService.getChatHistory(
      req.user.id,
      partnerId,
    );
    return res.status(200).json(apiResponse.success(messages));
  } catch (error) {
    next(error);
  }
}

export async function postMessage(req, res, next) {
  try {
    const { receiverId, message } = req.body;
    const sentMessage = await notificationService.sendMessage(
      req.user.id,
      receiverId,
      message,
    );
    return res
      .status(201)
      .json(apiResponse.success(sentMessage, "Message sent"));
  } catch (error) {
    next(error);
  }
}

// THIS WAS THE MISSING ONE CAUSING THE PATCH ERROR
export async function respondToRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await notificationService.updateRequestStatus(
      id,
      req.user.id,
      status,
    );
    return res
      .status(200)
      .json(apiResponse.success(request, `Request ${status}`));
  } catch (error) {
    next(error);
  }
}
