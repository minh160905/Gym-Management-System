import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, classesTable, staffTable } from "@workspace/db";
import {
  ListClassesQueryParams,
  ListClassesResponse,
  CreateClassBody,
  GetClassParams,
  GetClassResponse,
  UpdateClassParams,
  UpdateClassBody,
  UpdateClassResponse,
  DeleteClassParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/classes", async (req, res): Promise<void> => {
  const query = ListClassesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let baseQuery = db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      description: classesTable.description,
      trainerId: classesTable.trainerId,
      trainerName: sql<string | null>`concat(${staffTable.firstName}, ' ', ${staffTable.lastName})`,
      capacity: classesTable.capacity,
      enrolledCount: classesTable.enrolledCount,
      scheduledAt: classesTable.scheduledAt,
      durationMinutes: classesTable.durationMinutes,
      location: classesTable.location,
      category: classesTable.category,
      status: classesTable.status,
      endDate: classesTable.endDate,
      createdAt: sql<string>`${classesTable.createdAt}::text`,
      updatedAt: sql<string>`${classesTable.updatedAt}::text`,
    })
    .from(classesTable)
    .leftJoin(staffTable, eq(classesTable.trainerId, staffTable.id))
    .$dynamic();

  if (query.data.status) {
    baseQuery = baseQuery.where(eq(classesTable.status, query.data.status));
  }

  const classes = await baseQuery;
  res.json(ListClassesResponse.parse(classes));
});

router.post("/classes", async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db.insert(classesTable).values(parsed.data).returning();

  const trainer = cls.trainerId
    ? await db.select().from(staffTable).where(eq(staffTable.id, cls.trainerId))
    : [];

  res.status(201).json(GetClassResponse.parse({
    ...cls,
    trainerName: trainer[0] ? `${trainer[0].firstName} ${trainer[0].lastName}` : null,
    createdAt: cls.createdAt.toISOString(),
    updatedAt: cls.updatedAt.toISOString(),
  }));
});

router.get("/classes/:id", async (req, res): Promise<void> => {
  const params = GetClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cls] = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      description: classesTable.description,
      trainerId: classesTable.trainerId,
      trainerName: sql<string | null>`concat(${staffTable.firstName}, ' ', ${staffTable.lastName})`,
      capacity: classesTable.capacity,
      enrolledCount: classesTable.enrolledCount,
      scheduledAt: classesTable.scheduledAt,
      durationMinutes: classesTable.durationMinutes,
      location: classesTable.location,
      category: classesTable.category,
      status: classesTable.status,
      endDate: classesTable.endDate,
      createdAt: sql<string>`${classesTable.createdAt}::text`,
      updatedAt: sql<string>`${classesTable.updatedAt}::text`,
    })
    .from(classesTable)
    .leftJoin(staffTable, eq(classesTable.trainerId, staffTable.id))
    .where(eq(classesTable.id, params.data.id));

  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  res.json(GetClassResponse.parse(cls));
});

router.patch("/classes/:id", async (req, res): Promise<void> => {
  const params = UpdateClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db
    .update(classesTable)
    .set(parsed.data)
    .where(eq(classesTable.id, params.data.id))
    .returning();

  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  const trainer = cls.trainerId
    ? await db.select().from(staffTable).where(eq(staffTable.id, cls.trainerId))
    : [];

  res.json(UpdateClassResponse.parse({
    ...cls,
    trainerName: trainer[0] ? `${trainer[0].firstName} ${trainer[0].lastName}` : null,
    createdAt: cls.createdAt.toISOString(),
    updatedAt: cls.updatedAt.toISOString(),
  }));
});

router.delete("/classes/:id", async (req, res): Promise<void> => {
  const params = DeleteClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cls] = await db
    .delete(classesTable)
    .where(eq(classesTable.id, params.data.id))
    .returning();

  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
