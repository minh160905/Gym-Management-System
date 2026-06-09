import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membersTable, staffTable, ptRequests } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

async function formatPTRequest(p: typeof ptRequests.$inferSelect) {
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, p.memberId));
  let trainerName = null;
  if (p.trainerId) {
    const [trainer] = await db.select().from(staffTable).where(eq(staffTable.id, p.trainerId));
    trainerName = trainer ? `${trainer.firstName} ${trainer.lastName}` : null;
  }
  return {
    id: p.id,
    memberId: p.memberId,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    trainerId: p.trainerId,
    trainerName,
    message: p.message,
    preferredSchedule: p.preferredSchedule,
    status: p.status,
    sessionsCount: p.sessionsCount,
    desiredDuration: p.desiredDuration,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: p.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/pt-requests", async (req, res): Promise<void> => {
  let rows = await db.select().from(ptRequests).orderBy(ptRequests.createdAt);
  if (req.query.memberId) rows = rows.filter((r) => r.memberId === parseInt(req.query.memberId as string));
  if (req.query.trainerId) rows = rows.filter((r) => r.trainerId === parseInt(req.query.trainerId as string));
  if (req.query.status) rows = rows.filter((r) => r.status === req.query.status);
  const result = await Promise.all(rows.map(formatPTRequest));
  res.json(result);
});

const CreatePTRequestBody = z.object({
  memberId: z.coerce.number(),
  trainerId: z.coerce.number().nullable().optional(),
  message: z.string().nullable().optional(),
  preferredSchedule: z.string().nullable().optional(),
  sessionsCount: z.coerce.number().nullable().optional(),
  desiredDuration: z.string().nullable().optional(),
});

router.post("/pt-requests", async (req, res): Promise<void> => {
  console.log("POST /pt-requests body:", req.body);
  const body = CreatePTRequestBody.safeParse(req.body);
  if (!body.success) {
    console.error("Zod validation error:", body.error.format());
    res.status(400).json({ error: body.error.message });
    return;
  }
  try {
    const [row] = await db.insert(ptRequests).values({ ...body.data, status: "pending" } as any).returning();
    res.status(201).json(await formatPTRequest(row));
  } catch (dbErr: any) {
    console.error("Database insert error:", dbErr);
    res.status(500).json({ error: dbErr.message });
  }
});

const UpdatePTRequestBody = z.object({
  trainerId: z.coerce.number().nullable().optional(),
  status: z.string().optional(),
  message: z.string().nullable().optional(),
  sessionsCount: z.coerce.number().nullable().optional(),
  desiredDuration: z.string().nullable().optional(),
});

router.patch("/pt-requests/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const body = UpdatePTRequestBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db
    .update(ptRequests)
    .set({ ...body.data, updatedAt: new Date() } as any)
    .where(eq(ptRequests.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatPTRequest(row));
});

export default router;
