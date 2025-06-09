import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  //this will be cleark ID
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull(),
  image: text("image").notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
