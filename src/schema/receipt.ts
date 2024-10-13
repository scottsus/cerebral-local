import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    buyer: varchar("buyer", { length: 256 }),
    productDescription: text("product_description"),
    phone_num: varchar("phone_num", { length: 15 }),
    flagged: boolean("flagged").default(false),
    additional_data: text("additional_data"), 
    address: varchar("address", { length: 256 }),
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
      .default('in progress'),

  },
  (example) => ({
    idIdx: index("receipt_buyer_idx").on(example.buyer),
  }),
);
