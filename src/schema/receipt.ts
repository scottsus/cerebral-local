import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const receipts = pgTable(
  "receipts",
  {
    id: serial("id")
      .primaryKey()
      .notNull(),
    buyer: varchar("buyer", { length: 256 }),
    productDescription: text("product_description"),
    phone_num: varchar("phone_num", { length: 15 }),
    additional_data: text("additional_data"), 
    address: varchar("address", { length: 256 }),
    // business_owner: serial("id").references()
    purchase_date: timestamp("purchase_date", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    status: varchar("status", { length: 256 })
      .default('In progress'),

  },
  (example) => ({
    idIdx: index("receipt_buyer_idx").on(example.buyer),
  }),
);
