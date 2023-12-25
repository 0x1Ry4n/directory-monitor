import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "../config/connectDatabase";
import { zParse } from "../middlewares/validation.middleware";

const prisma = Prisma.getPrisma();

const createNotificationSchema = z.object({
  body: z.object({
    folderId: z
    .string({
      required_error: "folderId reference is required",
    }),
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
      .optional(),
  }),
});

const createNotification = async (req: Request, res: Response) => {
  try {
    const { body } = await zParse(createNotificationSchema, req);

    const { event, notificationType, objectType, extension, folderId } = body;

    if (objectType !== "folder" && !extension) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const newNotification = await prisma.notification.create({
      data: {
        notificationType,
        objectType,
        extension,
        event,
        folder: {
          connect: {
            folderPath: folderId,
          },
        },
      },
    });

    return res.status(200).json(newNotification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Bad Request", details: error.issues });
    } else {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }
};

const deleteNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.deleteMany()
    return res.status(200).json(notifications);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany();
    return res.status(200).json(notifications);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export default {
  createNotification,
  getNotifications,
  deleteNotifications
};
