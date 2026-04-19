import { pgTable, serial, varchar, text, date, timestamp } from "drizzle-orm/pg-core";

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  purchaseDate: date("purchase_date"),
  condition: varchar("condition", { length: 20 }).notNull().default("good"),
  status: varchar("status", { length: 20 }).notNull().default("operational"),
  location: varchar("location", { length: 100 }),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
