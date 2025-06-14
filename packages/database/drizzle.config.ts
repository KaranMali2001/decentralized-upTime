import dotenv from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
dotenv.config();
export default defineConfig({
  out: "./drizzle",
  schema: "./src/models/*",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
