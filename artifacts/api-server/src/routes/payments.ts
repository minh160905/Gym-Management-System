import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membersTable, membershipPlansTable, payments } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

async function formatPayment(p: typeof payments.$inferSelect) {
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, p.memberId));
  let planName = null;
  if (p.membershipPlanId) {
    const [plan] = await db.select().from(membershipPlansTable).where(eq(membershipPlansTable.id, p.membershipPlanId));
    planName = plan?.name ?? null;
  }
  return {
    id: p.id,
    memberId: p.memberId,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    amount: parseFloat(p.amount as unknown as string),
    description: p.description,
    status: p.status,
    paymentMethod: p.paymentMethod,
    paymentDate: p.paymentDate,
    membershipPlanId: p.membershipPlanId,
    membershipPlanName: planName,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/payments", async (req, res): Promise<void> => {
  let rows = await db.select().from(payments).orderBy(payments.paymentDate);
  if (req.query.memberId) rows = rows.filter((r) => r.memberId === parseInt(req.query.memberId as string));
  if (req.query.status) rows = rows.filter((r) => r.status === req.query.status);
  const result = await Promise.all(rows.map(formatPayment));
  res.json(result);
});

const CreatePaymentBody = z.object({
  memberId: z.number(),
  amount: z.number(),
  description: z.string().min(1),
  status: z.string().default("paid"),
  paymentMethod: z.string().nullable().optional(),
  paymentDate: z.string(),
  membershipPlanId: z.number().nullable().optional(),
});

router.post("/payments", async (req, res): Promise<void> => {
  const body = CreatePaymentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(payments).values(body.data as any).returning();
  res.status(201).json(await formatPayment(row));
});

const UpdatePaymentBody = z.object({
  status: z.string().optional(),
  paymentMethod: z.string().nullable().optional(),
});

router.patch("/payments/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const body = UpdatePaymentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.update(payments).set(body.data as any).where(eq(payments.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatPayment(row));
});

export default router;
