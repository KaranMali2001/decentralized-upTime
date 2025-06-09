import express from "express";
import { userWebhook } from "../controllers/webHookController";

const webHookRouter = express.Router();

webHookRouter.post(
  "/user",
  express.raw({ type: "application/json" }),
  userWebhook
);

export default webHookRouter;
