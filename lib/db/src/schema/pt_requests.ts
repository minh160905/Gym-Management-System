import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { membersTable } from "./members";
import { staffTable } from "./staff";

export const ptRequests = pgTable("pt_requests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => membersTable.id, { onDelete: "cascade" }).notNull(),
  trainerId: integer("trainer_id").references(() => staffTable.id, { onDelete: "set null" }),
  message: text("message"),
  preferredSchedule: varchar("preferred_schedule", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  sessionsCount: integer("sessions_count"),
  desiredDuration: text("desired_duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
