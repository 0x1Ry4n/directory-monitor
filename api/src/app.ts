import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import NotificationRouter from "./routes/notification.route";
import FolderRouter from "./routes/folder.route";
import "dotenv/config";

export const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT;

async function main() {
  app.use(express.json());

  app.use("/api/folder", FolderRouter);
  app.use("/api/notifications", NotificationRouter);

  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
