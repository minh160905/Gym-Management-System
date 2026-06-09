import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, bookingsTable, membersTable, classesTable } from "@workspace/db";
import {
  ListBookingsQueryParams,
  ListBookingsResponse,
  CreateBookingBody,
  UpdateBookingParams,
  UpdateBookingBody,
  UpdateBookingResponse,
  DeleteBookingParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", async (req, res): Promise<void> => {
  const query = ListBookingsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.memberId) conditions.push(eq(bookingsTable.memberId, query.data.memberId));
  if (query.data.classId) conditions.push(eq(bookingsTable.classId, query.data.classId));
  if (query.data.status) conditions.push(eq(bookingsTable.status, query.data.status));

  const bookings = await db
    .select({
      id: bookingsTable.id,
      memberId: bookingsTable.memberId,
      memberName: sql<string | null>`concat(${membersTable.firstName}, ' ', ${membersTable.lastName})`,
      classId: bookingsTable.classId,
      className: classesTable.name,
      status: bookingsTable.status,
      bookedAt: bookingsTable.bookedAt,
      createdAt: sql<string>`${bookingsTable.createdAt}::text`,
      updatedAt: sql<string>`${bookingsTable.updatedAt}::text`,
    })
    .from(bookingsTable)
    .leftJoin(membersTable, eq(bookingsTable.memberId, membersTable.id))
    .leftJoin(classesTable, eq(bookingsTable.classId, classesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(ListBookingsResponse.parse(bookings));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db.select().from(classesTable).where(eq(classesTable.id, parsed.data.classId));
  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  if (cls.enrolledCount >= cls.capacity) {
    res.status(400).json({ error: "Lớp học đã đầy." });
    return;
  }

  const now = new Date().toISOString();
  const [booking] = await db.insert(bookingsTable).values({
    ...parsed.data,
    status: "confirmed",
    bookedAt: now,
  }).returning();

  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, booking.memberId));

  // Update enrolled count
  await db.update(classesTable)
    .set({ enrolledCount: (cls.enrolledCount ?? 0) + 1 })
    .where(eq(classesTable.id, booking.classId));

  res.status(201).json({
    ...booking,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    className: cls.name ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  });
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const params = UpdateBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set(parsed.data)
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, booking.memberId));
  const [cls] = await db.select().from(classesTable).where(eq(classesTable.id, booking.classId));

  res.json(UpdateBookingResponse.parse({
    ...booking,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    className: cls?.name ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }));
});

router.delete("/bookings/:id", async (req, res): Promise<void> => {
  const params = DeleteBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db
    .delete(bookingsTable)
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
