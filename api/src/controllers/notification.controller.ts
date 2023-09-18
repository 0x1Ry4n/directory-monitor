import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../app";
import { zParse } from "../middlewares/validation.middleware";

const createNotificationSchema = z.object({
  body: z.object({
    folderId: z
      .string({
        required_error: "folderId reference is required",
      })
      .uuid(),
    notificationType: z.enum(["created", "moved", "modified", "deleted"], {
      required_error: "notificationType is required",
    }),
    event: z.string({
      required_error: "message is required"
    })
    .optional(),
    objectType: z.enum(["folder", "file"], {
      required_error: "objectType is required",
    }),
    extension: z
      .string({
        required_error: "extension is required",
      })
      .min(1)
      .optional(),
  }),
});

const createNotification = async (req: Request, res: Response) => {
  try {
    const { body } = await zParse(createNotificationSchema, req);

    const { event, notificationType, objectType, extension, folderId } = body;

    if (objectType !== "folder" && !extension) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    const newNotification = await prisma.notification.create({
      data: {
        notificationType,
        event,
        objectType,
        extension,
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
      res.status(400).json({ error: "Bad Request", details: error.issues });
    } else {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
};

const deleteNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.deleteMany()
    res.status(200).json(notifications);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        folder: true,
      },
    });
    res.status(200).json(notifications);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

export default {
  createNotification,
  getNotifications,
  deleteNotifications
};
