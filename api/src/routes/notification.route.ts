import express from "express";
import NotificationController from "../controllers/notification.controller";

const NotificationRouter = express.Router();

NotificationRouter.post("/create", NotificationController.createNotification);
NotificationRouter.get("/list", NotificationController.getNotifications);
NotificationRouter.delete("/deleteAll", NotificationController.deleteNotifications);

export default NotificationRouter;
