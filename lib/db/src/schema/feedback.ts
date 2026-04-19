import { pgTable, serial, integer, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { membersTable } from "./members";

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => membersTable.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull().default("general"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
