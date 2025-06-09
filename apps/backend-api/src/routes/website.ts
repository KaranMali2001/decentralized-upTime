import { Router } from "express";
import {
  createWebsiteController,
  deleteWebsiteController,
  getAllWebsitesController,
  getWebsiteByIdController,
} from "../controllers/websiteController";
import { ClerkMiddleware } from "../middleware/clerkMiddleware";
export const webSiteRouter = Router();

webSiteRouter.get("/:id", ClerkMiddleware, getWebsiteByIdController);
//create a new website
webSiteRouter.post("/", ClerkMiddleware, createWebsiteController);
//get all websites
webSiteRouter.get("/", ClerkMiddleware, getAllWebsitesController);
webSiteRouter.delete("/:id", ClerkMiddleware, deleteWebsiteController);
