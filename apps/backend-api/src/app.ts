import cors from "cors";
import "dotenv/config";
import express, { Errback, Request, Response } from "express";
import morgan from "morgan";
import { payOutRouter } from "./routes/payout";
import webHookRouter from "./routes/webhook";
import { webSiteRouter } from "./routes/website";
export const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("dev"));

app.use("/webhook", webHookRouter);
app.use(express.json());
app.use("/website", webSiteRouter);
app.use("/payout", payOutRouter);
app.get("/health", (req: Request, res: Response) => {
  res.send("Server is up and running").status(200);
});
app.use((err: Errback, req: Request, res: Response, _next: Function) => {
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}`
  );
  console.error(err);
  res.status(500).send("Something went wrong");
});
app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running");
});
