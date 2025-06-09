import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
export const chainEnum = pgEnum("chain", ["sol"]);
export const validatorTable = pgTable("validators", {
  id: serial("id").primaryKey(),
  publicKey: text("public_key").notNull().unique(),
  chain: chainEnum("chain").notNull(),
  location: text("location").notNull(),
  ipAddress: text("ip_address").notNull(),
  pendingPayOuts: integer("pending_payouts").notNull(),
  tempSignedMessage: text("temp_signed_message"),
  signedMessageExpiry: timestamp("signed_message_expiry"),
  isProcessing: boolean("is_processing").default(false), //set true when withdrawing
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
