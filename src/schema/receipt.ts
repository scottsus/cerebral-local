import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const posts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey(),
    buyer: varchar("buyer", { length: 256 }),
    productDescription: text("product_description"),
    purchase_date: timestamp("purchase_date", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    idIdx: index("receipt_buyer_idx").on(example.buyer),
  }),
);
