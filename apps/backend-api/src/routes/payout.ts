import { Router } from "express";
import {
  getMessageController,
  getPayOutBalanceController,
  withDrawPayOutController,
} from "../controllers/payoutController";

export const payOutRouter = Router();
payOutRouter.get("/balance/:publicKey", getPayOutBalanceController);
payOutRouter.post("/withdraw/", withDrawPayOutController);
payOutRouter.get("/getMessage/:publicKey", getMessageController);
