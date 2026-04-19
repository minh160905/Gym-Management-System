import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membersTable, feedback } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

router.get("/feedback", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: feedback.id,
      memberId: feedback.memberId,
      memberName: membersTable.firstName,
      memberLastName: membersTable.lastName,
      rating: feedback.rating,
      comment: feedback.comment,
      serviceType: feedback.serviceType,
      isPublic: feedback.isPublic,
      createdAt: feedback.createdAt,
    })
    .from(feedback)
    .leftJoin(membersTable, eq(feedback.memberId, membersTable.id))
    .orderBy(feedback.createdAt);

  let result = rows.map((r) => ({
    ...r,
    memberName: r.memberName && r.memberLastName ? `${r.memberName} ${r.memberLastName}` : r.memberName ?? null,
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  if (req.query.memberId) {
    const mid = parseInt(req.query.memberId as string);
    result = result.filter((r) => r.memberId === mid);
  }
  if (req.query.serviceType) {
    result = result.filter((r) => r.serviceType === req.query.serviceType);
  }

  res.json(result);
});

const CreateFeedbackBody = z.object({
  memberId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  serviceType: z.string().default("general"),
  isPublic: z.boolean().optional().default(true),
});

router.post("/feedback", async (req, res): Promise<void> => {
  const body = CreateFeedbackBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(feedback).values(body.data as any).returning();

  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, row.memberId));
  res.status(201).json({
    ...row,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.delete("/feedback/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(feedback).where(eq(feedback.id, id));
  res.status(204).send();
});

export default router;
