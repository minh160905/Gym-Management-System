import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { staffTable } from "./staff";
import { membersTable } from "./members";

export const workoutPlansTable = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  trainerId: integer("trainer_id").notNull().references(() => staffTable.id),
  memberId: integer("member_id").notNull().references(() => membersTable.id),
  exercises: text("exercises").notNull().default("[]"),
  goal: text("goal"),
  durationWeeks: integer("duration_weeks").notNull().default(4),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlansTable.$inferSelect;
