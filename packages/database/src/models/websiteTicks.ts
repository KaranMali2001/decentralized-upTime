import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { validatorTable } from "./validators";
import { websiteTable } from "./website";

export const statusEnum = pgEnum("status", [
  "up",
  "down",
  "unknown",
  "unreachable",
  "timeout",
  "error",
]);
export const websiteTicksTable = pgTable("website_ticks", {
  id: serial("id").primaryKey(),
  status: statusEnum("status").notNull(),
  latency: integer("latency").notNull(),
  updatedFromLocation: text("updated_from_location").notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
  websiteId: integer("website_id")
    .notNull()
    .references(() => websiteTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  validatorId: integer()
    .notNull()
    .references(() => validatorTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
});
export const websiteTicksSchema = createInsertSchema(websiteTicksTable, {
  createdAt: (schema) => schema.optional(),
  updatedAt: (schema) => schema.optional(),
  id: (schema) => schema.optional(),
});
export type WebsiteTickInsert = typeof websiteTable.$inferInsert;

export type WebsiteTickSelect = typeof websiteTable.$inferSelect;
