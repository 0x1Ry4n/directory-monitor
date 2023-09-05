import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../app";
import { zParse } from "../middlewares/validation.middleware";

const createNotificationSchema = z.object({
  body: z.object({
    folderId: z.string().uuid(),
    notificationType: z.enum(["add", "move", "delete"]),
    objectType: z.enum(["folder", "file"]),
    extension: z.string().min(1).optional(),
    modificationDate: z.string().datetime(),
  }),
});

const createNotification = async (req: Request, res: Response) => {
  try {
    const { body } = await zParse(createNotificationSchema, req);

    const {
      notificationType,
      objectType,
      extension,
      modificationDate,
      folderId,
    } = body;

    if (objectType !== "folder" && !extension) {
      res.status(400).json({ error: "Bad request" });
      return;
    }

    const newNotification = await prisma.notification.create({
      data: {
        notificationType,
        objectType,
        extension,
        modificationDate,
        folder: {
          connect: {
            id: folderId,
          },
        },
      },
    });

    res.status(200).json(newNotification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Bad request", details: error.issues });
    } else {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
};

const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany();
    res.status(200).json(notifications);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

export default {
  createNotification,
  getNotifications,
};
