import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { membersTable } from "./members";
import { staffTable } from "./staff";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  memberId: integer("member_id").references(() => membersTable.id, { onDelete: "set null" }),
  staffId: integer("staff_id").references(() => staffTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
