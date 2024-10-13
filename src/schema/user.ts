import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const listenerStatusEnum = pgEnum("listener_status", [
  "INITIALIZING",
  "RUNNING",
  "EXITED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    name: text("name"),
    email: text("email"),
    phoneNumber: varchar("phone_number", { length: 15 }),
    businessDescription: text("business_description"),
    welcomeMessage: text("welcome_message"),
    listenerStatus:
      listenerStatusEnum("listener_status").default("INITIALIZING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    idIdx: index("user_id_idx").on(table.id),
  }),
);
