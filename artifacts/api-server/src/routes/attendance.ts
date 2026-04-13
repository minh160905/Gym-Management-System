import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, attendanceTable, membersTable, classesTable } from "@workspace/db";
import {
  ListAttendanceQueryParams,
  ListAttendanceResponse,
  CreateAttendanceBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/attendance", async (req, res): Promise<void> => {
  const query = ListAttendanceQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.memberId) conditions.push(eq(attendanceTable.memberId, query.data.memberId));
  if (query.data.classId) conditions.push(eq(attendanceTable.classId, query.data.classId));

  const records = await db
    .select({
      id: attendanceTable.id,
      memberId: attendanceTable.memberId,
      memberName: null as string | null,
      classId: attendanceTable.classId,
      className: null as string | null,
      checkedInAt: attendanceTable.checkedInAt,
      checkedOutAt: attendanceTable.checkedOutAt,
      createdAt: attendanceTable.createdAt,
    })
    .from(attendanceTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Enrich with names
  const enriched = await Promise.all(records.map(async (r) => {
    const [member] = r.memberId ? await db.select().from(membersTable).where(eq(membersTable.id, r.memberId)) : [];
    const [cls] = r.classId ? await db.select().from(classesTable).where(eq(classesTable.id, r.classId)) : [];
    return {
      ...r,
      memberName: member ? `${member.firstName} ${member.lastName}` : null,
      className: cls?.name ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }));

  res.json(ListAttendanceResponse.parse(enriched));
});

router.post("/attendance", async (req, res): Promise<void> => {
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db.insert(attendanceTable).values(parsed.data).returning();

  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, record.memberId));
  const [cls] = record.classId ? await db.select().from(classesTable).where(eq(classesTable.id, record.classId)) : [];

  res.status(201).json({
    ...record,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    className: cls?.name ?? null,
    createdAt: record.createdAt.toISOString(),
  });
});

export default router;
