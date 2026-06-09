import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, ptSessionsTable, staffTable, membersTable, bookingsTable, classesTable } from "@workspace/db";
import {
  ListSessionsQueryParams,
  ListSessionsResponse,
  CreateSessionBody,
  GetSessionParams,
  GetSessionResponse,
  UpdateSessionParams,
  UpdateSessionBody,
  UpdateSessionResponse,
  DeleteSessionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function sessionWithNames(session: typeof ptSessionsTable.$inferSelect) {
  const [trainer] = await db.select().from(staffTable).where(eq(staffTable.id, session.trainerId));
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, session.memberId));
  return {
    ...session,
    trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : null,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

router.get("/sessions", async (req, res): Promise<void> => {
  const query = ListSessionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.trainerId) conditions.push(eq(ptSessionsTable.trainerId, query.data.trainerId));
  if (query.data.memberId) conditions.push(eq(ptSessionsTable.memberId, query.data.memberId));
  if (query.data.status) conditions.push(eq(ptSessionsTable.status, query.data.status));

  const sessions = await db.select().from(ptSessionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const result = await Promise.all(sessions.map(sessionWithNames));
  res.json(ListSessionsResponse.parse(result));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check overlap with any registered classes
  const ptStart = new Date(parsed.data.scheduledAt);
  const ptEnd = new Date(ptStart.getTime() + (parsed.data.durationMinutes ?? 60) * 60 * 1000);

  // Fetch confirmed class bookings for the member
  const memberBookings = await db.select().from(bookingsTable)
    .where(and(eq(bookingsTable.memberId, parsed.data.memberId), eq(bookingsTable.status, "confirmed")));

  for (const booking of memberBookings) {
    const [cls] = await db.select().from(classesTable).where(eq(classesTable.id, booking.classId));
    if (!cls) continue;

    const classStart = new Date(cls.scheduledAt);
    const classEnd = new Date(classStart.getTime() + (cls.durationMinutes ?? 60) * 60 * 1000);

    // Overlap condition: ptStart < classEnd && ptEnd > classStart
    if (ptStart < classEnd && ptEnd > classStart) {
      const formatTime = (d: Date) => {
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + 
               " ngày " + d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      };
      res.status(400).json({ 
        error: `Trùng lịch! Hội viên đã đăng ký tham gia lớp học "${cls.name}" diễn ra từ ${formatTime(classStart)} đến ${formatTime(classEnd)}.` 
      });
      return;
    }
  }

  const [session] = await db.insert(ptSessionsTable).values(parsed.data).returning();
  res.status(201).json(GetSessionResponse.parse(await sessionWithNames(session)));
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const params = GetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db.select().from(ptSessionsTable).where(eq(ptSessionsTable.id, params.data.id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(GetSessionResponse.parse(await sessionWithNames(session)));
});

router.patch("/sessions/:id", async (req, res): Promise<void> => {
  const params = UpdateSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .update(ptSessionsTable)
    .set(parsed.data)
    .where(eq(ptSessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(UpdateSessionResponse.parse(await sessionWithNames(session)));
});

router.delete("/sessions/:id", async (req, res): Promise<void> => {
  const params = DeleteSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .delete(ptSessionsTable)
    .where(eq(ptSessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
