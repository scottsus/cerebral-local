import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./user";

export const statusEnum = pgEnum("status", [
  "INPROGRESS",
  "COMPLETED",
  "FLAGGED",
  "CANCELLED",
]);

export const receipts = pgTable(
  "receipts",
  {
    id: serial("id").primaryKey().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    buyer: text("buyer"),
    phoneNumber: varchar("phone_number", { length: 15 }),
    address: text("address"),
    purchaseDate: timestamp("purchase_date", { withTimezone: true }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    productDescription: text("product_description"),
    additionalData: text("additional_data"),
    status: statusEnum("status").default("INPROGRESS"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    idIdx: index("receipt_buyer_idx").on(table.buyer),
  }),
);
