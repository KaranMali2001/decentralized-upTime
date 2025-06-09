import { seed } from "drizzle-seed";
import { db } from "./index";
import { userTable } from "./models/user";
import { validatorTable } from "./models/validators";
import { websiteTable } from "./models/website";
import { websiteTicksTable } from "./models/websiteTicks";
(async () => {
  await seed(db, {
    userTable,
    validatorTable,
    websiteTable,
    websiteTicksTable,
  });
})();
