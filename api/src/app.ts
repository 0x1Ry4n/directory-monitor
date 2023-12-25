import express, { Request, Response } from "express";
import NotificationRouter from "./routes/notification.route";
import FolderRouter from "./routes/folder.route";
import { Prisma } from "./config/connectDatabase"
import { Redis } from "./config/connectRedis";
import { errorMorgan, infoMorgan } from "./middlewares/morgan.middleware";
import { errorHandler } from "./utils/error-handler";
import "dotenv/config";

const app = express();
const port = process.env.PORT;

async function main() {
  app.use(errorMorgan)
  app.use(infoMorgan)

  app.use(express.json());

  app.use("/api/folder", FolderRouter);
  app.use("/api/notifications", NotificationRouter);

  app.use(errorHandler)

  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
  });
}

async function testCache() {
  const cache = await Redis.getCache()
  await cache.set("test", 10)
  const cachedInRedis = await cache.get("test")
  console.log(cachedInRedis)
}

main()
  .then(async () => {
    await Prisma.connectPrisma()
    await testCache()
  })
  .catch(async (e) => {
    console.error(e);
    await Prisma.disconnectPrisma();
    process.exit(1);
  });
