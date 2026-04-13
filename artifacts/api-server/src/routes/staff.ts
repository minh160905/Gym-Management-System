import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import {
  ListStaffQueryParams,
  ListStaffResponse,
  CreateStaffBody,
  GetStaffParams,
  GetStaffResponse,
  UpdateStaffParams,
  UpdateStaffBody,
  UpdateStaffResponse,
  DeleteStaffParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function staffToResponse(s: typeof staffTable.$inferSelect) {
  return {
    ...s,
    salary: s.salary != null ? parseFloat(s.salary) : null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/staff", async (req, res): Promise<void> => {
  const query = ListStaffQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let baseQuery = db.select().from(staffTable).$dynamic();
  if (query.data.role) {
    baseQuery = baseQuery.where(eq(staffTable.role, query.data.role));
  }

  const staff = await baseQuery;
  res.json(ListStaffResponse.parse(staff.map(staffToResponse)));
});

router.post("/staff", async (req, res): Promise<void> => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [s] = await db.insert(staffTable).values({
    ...parsed.data,
    salary: parsed.data.salary != null ? String(parsed.data.salary) : null,
  }).returning();

  res.status(201).json(GetStaffResponse.parse(staffToResponse(s)));
});

router.get("/staff/:id", async (req, res): Promise<void> => {
  const params = GetStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [s] = await db.select().from(staffTable).where(eq(staffTable.id, params.data.id));

  if (!s) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.json(GetStaffResponse.parse(staffToResponse(s)));
});

router.patch("/staff/:id", async (req, res): Promise<void> => {
  const params = UpdateStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.salary !== undefined) updateData.salary = parsed.data.salary != null ? String(parsed.data.salary) : null;

  const [s] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!s) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.json(UpdateStaffResponse.parse(staffToResponse(s)));
});

router.delete("/staff/:id", async (req, res): Promise<void> => {
  const params = DeleteStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [s] = await db.delete(staffTable).where(eq(staffTable.id, params.data.id)).returning();

  if (!s) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
