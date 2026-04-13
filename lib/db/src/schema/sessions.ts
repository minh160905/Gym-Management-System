import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { staffTable } from "./staff";
import { membersTable } from "./members";

export const ptSessionsTable = pgTable("pt_sessions", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull().references(() => staffTable.id),
  memberId: integer("member_id").notNull().references(() => membersTable.id),
  scheduledAt: text("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPTSessionSchema = createInsertSchema(ptSessionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPTSession = z.infer<typeof insertPTSessionSchema>;
export type PTSession = typeof ptSessionsTable.$inferSelect;
