import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "../config/connectDatabase";
import { zParse } from "../middlewares/validation.middleware";

const prisma = Prisma.getPrisma();

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

    const newFolder = await prisma.folder.upsert({
      where:  { folderPath: folderPath }, 
      create: { folderPath: folderPath },
      update: {}, 
    });

    return res.status(200).json(newFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Bad Request", details: error.issues });
    } else {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }
};

const deleteFolders = async (req: Request, res: Response) => {
  try {
      const folders = await prisma.folder.deleteMany()
      return res.status(200).json(folders);
  } catch(e) {
    return res.status(500).json({ error: e })
  }
}

const getFolders = async (req: Request, res: Response) => {
  try {
    const folders = await prisma.folder.findMany();
    return res.status(200).json(folders);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export default {
  createFolder,
  getFolders,
  deleteFolders
};
