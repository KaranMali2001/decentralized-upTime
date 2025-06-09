import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { validatorTable } from "./validators";

export const txnTable = pgTable("txn", {
  id: serial("id").primaryKey(),
  fromPub: text("from").notNull(),
  toPub: text("to").notNull(),
  txnSignature: text("txnSignature").notNull(),
  amount: integer("amount").notNull(),
  validatorId: integer("validatorId")
    .notNull()
    .references(() => validatorTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
