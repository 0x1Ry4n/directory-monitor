import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../app";
import { zParse } from "../middlewares/validation.middleware";

const createFolderSchema = z.object({
  body: z.object({
    folderPath: z.string({
      required_error: "folder_path is required",
    }),
  }),
});

const createFolder = async (req: Request, res: Response) => {
  try {
    const { body } = await zParse(createFolderSchema, req);

    const { folderPath } = body;

    const newFolder = await prisma.folder.create({
      data: {
        folderPath,
      },
    });

    res.status(200).json(newFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Bad request", details: error.issues });
    } else {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
};

export default {
  createFolder,
};
