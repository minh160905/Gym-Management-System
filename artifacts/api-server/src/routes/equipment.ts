import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, equipment } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

function formatEquipment(e: typeof equipment.$inferSelect) {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    brand: e.brand,
    serialNumber: e.serialNumber,
    purchaseDate: e.purchaseDate,
    condition: e.condition,
    status: e.status,
    location: e.location,
    lastMaintenanceDate: e.lastMaintenanceDate,
    nextMaintenanceDate: e.nextMaintenanceDate,
    notes: e.notes,
    createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: e.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/equipment", async (req, res): Promise<void> => {
  let rows = await db.select().from(equipment).orderBy(equipment.name);
  if (req.query.status) rows = rows.filter((r) => r.status === req.query.status);
  if (req.query.category) rows = rows.filter((r) => r.category === req.query.category);
  res.json(rows.map(formatEquipment));
});

const CreateEquipmentBody = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  condition: z.string().default("good"),
  status: z.string().default("operational"),
  location: z.string().nullable().optional(),
  lastMaintenanceDate: z.string().nullable().optional(),
  nextMaintenanceDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

router.post("/equipment", async (req, res): Promise<void> => {
  const body = CreateEquipmentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db.insert(equipment).values(body.data as any).returning();
  res.status(201).json(formatEquipment(row));
});

router.get("/equipment/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(equipment).where(eq(equipment.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatEquipment(row));
});

const UpdateEquipmentBody = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  condition: z.string().optional(),
  status: z.string().optional(),
  location: z.string().nullable().optional(),
  lastMaintenanceDate: z.string().nullable().optional(),
  nextMaintenanceDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

router.patch("/equipment/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const body = UpdateEquipmentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db
    .update(equipment)
    .set({ ...body.data, updatedAt: new Date() } as any)
    .where(eq(equipment.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatEquipment(row));
});

router.delete("/equipment/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(equipment).where(eq(equipment.id, id));
  res.status(204).send();
});

export default router;
