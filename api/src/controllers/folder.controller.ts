import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../app";
import { zParse } from "../middlewares/validation.middleware";

const createFolderSchema = z.object({
  body: z.object({
    folderPath: z
      .string({
        required_error: "folderPath is required",
      })
      .min(10),
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
      res.status(400).json({ error: "Bad Request", details: error.issues });
    } else {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
};

const getFolders = async (req: Request, res: Response) => {
  try {
    const folders = await prisma.folder.findMany();
    res.status(200).json(folders);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

export default {
  createFolder,
  getFolders,
};
