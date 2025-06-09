import { db } from "../../../packages/database/src";
import { app } from "./app";

import dotenv from "dotenv";
const PORT = process.env.PORT || 8000;
dotenv.config();
(async () => {
  try {
    await db.execute("select 1");
  } catch (error) {
    console.error("Error:", error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
