import express from "express";
import NotificationController from "../controllers/notification.controller";

const NotificationRouter = express.Router();

NotificationRouter.post("/create", NotificationController.createNotification);
NotificationRouter.delete("/deleteAll", NotificationController.deleteNotifications)
NotificationRouter.get("/list", NotificationController.getNotifications);

export default NotificationRouter;
