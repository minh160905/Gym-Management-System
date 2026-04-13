import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membershipPlansTable } from "@workspace/db";
import {
  ListMembershipsResponse,
  CreateMembershipBody,
  UpdateMembershipParams,
  UpdateMembershipBody,
  UpdateMembershipResponse,
  DeleteMembershipParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function planToResponse(plan: typeof membershipPlansTable.$inferSelect) {
  return {
    ...plan,
    priceMonthly: parseFloat(plan.priceMonthly),
    isActive: plan.isActive === "true",
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

router.get("/memberships", async (_req, res): Promise<void> => {
  const plans = await db.select().from(membershipPlansTable).orderBy(membershipPlansTable.priceMonthly);
  res.json(ListMembershipsResponse.parse(plans.map(planToResponse)));
});

router.post("/memberships", async (req, res): Promise<void> => {
  const parsed = CreateMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db.insert(membershipPlansTable).values({
    ...parsed.data,
    priceMonthly: String(parsed.data.priceMonthly),
    isActive: parsed.data.isActive === undefined ? "true" : String(parsed.data.isActive),
  }).returning();

  res.status(201).json(planToResponse(plan));
});

router.patch("/memberships/:id", async (req, res): Promise<void> => {
  const params = UpdateMembershipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.priceMonthly !== undefined) updateData.priceMonthly = String(parsed.data.priceMonthly);
  if (parsed.data.isActive !== undefined) updateData.isActive = String(parsed.data.isActive);

  const [plan] = await db
    .update(membershipPlansTable)
    .set(updateData)
    .where(eq(membershipPlansTable.id, params.data.id))
    .returning();

  if (!plan) {
    res.status(404).json({ error: "Membership plan not found" });
    return;
  }

  res.json(UpdateMembershipResponse.parse(planToResponse(plan)));
});

router.delete("/memberships/:id", async (req, res): Promise<void> => {
  const params = DeleteMembershipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db
    .delete(membershipPlansTable)
    .where(eq(membershipPlansTable.id, params.data.id))
    .returning();

  if (!plan) {
    res.status(404).json({ error: "Membership plan not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
