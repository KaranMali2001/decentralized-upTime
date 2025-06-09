import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { userTable } from "./user";
export const websiteTable = pgTable("websites", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  disabled: boolean("disabled").default(false),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: text()
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
export const websiteSchema = createInsertSchema(websiteTable, {
  createdAt: (schema) => schema.optional(),
  updatedAt: (schema) => schema.optional(),
  id: (schema) => schema.optional(),
  description: (schema) => schema.optional(),
});
export type WebsiteInsert = typeof websiteTable.$inferInsert;

export type WebsiteSelect = typeof websiteTable.$inferSelect;
