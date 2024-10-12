import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const posts = pgTable(
    "receipts",
    {
      id: uuid("id").primaryKey(),
      name: varchar("name", { length: 256 }),
      createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date(),
      ),
    },
    (example) => ({
      nameIndex: index("name_idx").on(example.name),
    }),
  );