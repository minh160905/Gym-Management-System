import { pgTable, serial, integer, numeric, text, varchar, date, timestamp } from "drizzle-orm/pg-core";
import { membersTable, membershipPlansTable } from "./members";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => membersTable.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentDate: date("payment_date").notNull(),
  membershipPlanId: integer("membership_plan_id").references(() => membershipPlansTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
