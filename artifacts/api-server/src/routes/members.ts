import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, membersTable, membershipPlansTable } from "@workspace/db";
import {
  ListMembersQueryParams,
  ListMembersResponse,
  CreateMemberBody,
  GetMemberParams,
  GetMemberResponse,
  UpdateMemberParams,
  UpdateMemberBody,
  UpdateMemberResponse,
  DeleteMemberParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/members", async (req, res): Promise<void> => {
  const query = ListMembersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let baseQuery = db
    .select({
      id: membersTable.id,
      firstName: membersTable.firstName,
      lastName: membersTable.lastName,
      email: membersTable.email,
      phone: membersTable.phone,
      dateOfBirth: membersTable.dateOfBirth,
      membershipPlanId: membersTable.membershipPlanId,
      membershipPlanName: membershipPlansTable.name,
      status: membersTable.status,
      joinDate: membersTable.joinDate,
      expiryDate: membersTable.expiryDate,
      emergencyContact: membersTable.emergencyContact,
      notes: membersTable.notes,
      createdAt: sql<string>`${membersTable.createdAt}::text`,
      updatedAt: sql<string>`${membersTable.updatedAt}::text`,
    })
    .from(membersTable)
    .leftJoin(membershipPlansTable, eq(membersTable.membershipPlanId, membershipPlansTable.id))
    .$dynamic();

  if (query.data.status) {
    baseQuery = baseQuery.where(eq(membersTable.status, query.data.status));
  }

  const members = await baseQuery;
  res.json(ListMembersResponse.parse(members));
});

router.post("/members", async (req, res): Promise<void> => {
  const parsed = CreateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db.insert(membersTable).values(parsed.data).returning();
  const plan = member.membershipPlanId
    ? await db.select().from(membershipPlansTable).where(eq(membershipPlansTable.id, member.membershipPlanId))
    : [];

  res.status(201).json(GetMemberResponse.parse({
    ...member,
    membershipPlanName: plan[0]?.name ?? null,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  }));
});

router.get("/members/:id", async (req, res): Promise<void> => {
  const params = GetMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .select({
      id: membersTable.id,
      firstName: membersTable.firstName,
      lastName: membersTable.lastName,
      email: membersTable.email,
      phone: membersTable.phone,
      dateOfBirth: membersTable.dateOfBirth,
      membershipPlanId: membersTable.membershipPlanId,
      membershipPlanName: membershipPlansTable.name,
      status: membersTable.status,
      joinDate: membersTable.joinDate,
      expiryDate: membersTable.expiryDate,
      emergencyContact: membersTable.emergencyContact,
      notes: membersTable.notes,
      createdAt: sql<string>`${membersTable.createdAt}::text`,
      updatedAt: sql<string>`${membersTable.updatedAt}::text`,
    })
    .from(membersTable)
    .leftJoin(membershipPlansTable, eq(membersTable.membershipPlanId, membershipPlansTable.id))
    .where(eq(membersTable.id, params.data.id));

  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.json(GetMemberResponse.parse(member));
});

router.patch("/members/:id", async (req, res): Promise<void> => {
  const params = UpdateMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db
    .update(membersTable)
    .set(parsed.data)
    .where(eq(membersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  const plan = member.membershipPlanId
    ? await db.select().from(membershipPlansTable).where(eq(membershipPlansTable.id, member.membershipPlanId))
    : [];

  res.json(UpdateMemberResponse.parse({
    ...member,
    membershipPlanName: plan[0]?.name ?? null,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  }));
});

router.delete("/members/:id", async (req, res): Promise<void> => {
  const params = DeleteMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .delete(membersTable)
    .where(eq(membersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
