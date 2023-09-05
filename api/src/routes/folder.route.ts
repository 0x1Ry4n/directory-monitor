import express from "express";
import FolderController from "../controllers/folder.controller";

const FolderRouter = express.Router();

FolderRouter.post("/create", FolderController.createFolder);

export default FolderRouter;
