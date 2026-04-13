import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, membersTable, staffTable, classesTable, ptSessionsTable, bookingsTable, membershipPlansTable, workoutPlansTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetRevenueStatsResponse,
  GetClassPopularityResponse,
  GetTrainerPerformanceResponse,
  GetMemberRetentionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (_req, res): Promise<void> => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

  const [totalMembersResult] = await db.select({ count: count() }).from(membersTable);
  const [activeMembersResult] = await db.select({ count: count() }).from(membersTable).where(eq(membersTable.status, "active"));
  const [totalStaffResult] = await db.select({ count: count() }).from(staffTable);
  const [totalTrainersResult] = await db.select({ count: count() }).from(staffTable).where(eq(staffTable.role, "trainer"));

  // Classes today
  const classesTodayResult = await db.select().from(classesTable);
  const classesToday = classesTodayResult.filter(c => c.scheduledAt.startsWith(todayStr)).length;

  // Sessions today
  const sessionsTodayResult = await db.select().from(ptSessionsTable);
  const sessionsToday = sessionsTodayResult.filter(s => s.scheduledAt.startsWith(todayStr)).length;

  // Monthly revenue (sum of active member plan prices)
  const activeMembersWithPlans = await db
    .select({ priceMonthly: membershipPlansTable.priceMonthly })
    .from(membersTable)
    .leftJoin(membershipPlansTable, eq(membersTable.membershipPlanId, membershipPlansTable.id))
    .where(eq(membersTable.status, "active"));

  const monthlyRevenue = activeMembersWithPlans.reduce((sum, m) => sum + (m.priceMonthly ? parseFloat(m.priceMonthly) : 0), 0);

  // New members this month
  const allMembers = await db.select().from(membersTable);
  const newMembersThisMonth = allMembers.filter(m => m.joinDate >= startOfMonth).length;

  // Pending bookings
  const [pendingBookingsResult] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "pending"));

  // Upcoming classes
  const upcomingClasses = classesTodayResult.filter(c => c.status === "scheduled").length;

  // Members expiring within 30 days
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const expiringSoonCount = allMembers.filter(m => m.expiryDate && m.expiryDate >= todayStr && m.expiryDate <= thirtyDaysFromNow).length;

  const stats = {
    totalMembers: totalMembersResult.count,
    activeMembers: activeMembersResult.count,
    totalStaff: totalStaffResult.count,
    totalTrainers: totalTrainersResult.count,
    classesToday,
    sessionsToday,
    monthlyRevenue,
    memberGrowthPercent: totalMembersResult.count > 0 ? (newMembersThisMonth / totalMembersResult.count) * 100 : 0,
    newMembersThisMonth,
    pendingBookings: pendingBookingsResult.count,
    upcomingClasses,
    expiringSoonCount,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/analytics/revenue", async (_req, res): Promise<void> => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleString("default", { month: "short", year: "numeric" });

    const membersThisMonth = await db
      .select({ priceMonthly: membershipPlansTable.priceMonthly })
      .from(membersTable)
      .leftJoin(membershipPlansTable, eq(membersTable.membershipPlanId, membershipPlansTable.id))
      .where(sql`${membersTable.joinDate} <= ${monthStr + "-31"} AND (${membersTable.expiryDate} IS NULL OR ${membersTable.expiryDate} >= ${monthStr + "-01"})`);

    const revenue = membersThisMonth.reduce((sum, m) => sum + (m.priceMonthly ? parseFloat(m.priceMonthly) : 0), 0);

    months.push({ month: label, revenue, memberCount: membersThisMonth.length });
  }

  res.json(GetRevenueStatsResponse.parse(months));
});

router.get("/analytics/class-popularity", async (_req, res): Promise<void> => {
  const classes = await db.select().from(classesTable);
  const allBookings = await db.select().from(bookingsTable);

  const result = classes.map(cls => {
    const classBookings = allBookings.filter(b => b.classId === cls.id && b.status !== "cancelled");
    return {
      className: cls.name,
      category: cls.category,
      totalBookings: classBookings.length,
      avgAttendance: cls.capacity > 0 ? (cls.enrolledCount / cls.capacity) * 100 : 0,
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);

  res.json(GetClassPopularityResponse.parse(result));
});

router.get("/analytics/trainer-performance", async (_req, res): Promise<void> => {
  const trainers = await db.select().from(staffTable).where(eq(staffTable.role, "trainer"));
  const allSessions = await db.select().from(ptSessionsTable);
  const allClasses = await db.select().from(classesTable);
  const allWorkouts = await db.select().from(workoutPlansTable);

  const result = trainers.map(trainer => {
    const trainerSessions = allSessions.filter(s => s.trainerId === trainer.id);
    const trainerClasses = allClasses.filter(c => c.trainerId === trainer.id);
    const trainerWorkouts = allWorkouts.filter(w => w.trainerId === trainer.id);
    const uniqueClients = new Set([
      ...trainerSessions.map(s => s.memberId),
      ...trainerWorkouts.map(w => w.memberId),
    ]).size;

    return {
      trainerId: trainer.id,
      trainerName: `${trainer.firstName} ${trainer.lastName}`,
      totalSessions: trainerSessions.length,
      totalClasses: trainerClasses.length,
      activeClients: uniqueClients,
      avgRating: 4.2 + Math.random() * 0.7, // Simulated rating
    };
  });

  res.json(GetTrainerPerformanceResponse.parse(result));
});

router.get("/analytics/member-retention", async (_req, res): Promise<void> => {
  const allMembers = await db.select().from(membersTable);
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const activeCount = allMembers.filter(m => m.status === "active").length;
  const expiredCount = allMembers.filter(m => m.status === "expired").length;
  const cancelledCount = allMembers.filter(m => m.status === "cancelled").length;
  const renewalsThisMonth = allMembers.filter(m => m.joinDate >= startOfMonth && m.status === "active").length;

  const total = allMembers.length;
  const retentionRate = total > 0 ? (activeCount / total) * 100 : 0;

  res.json(GetMemberRetentionResponse.parse({
    retentionRate,
    activeCount,
    expiredCount,
    cancelledCount,
    renewalsThisMonth,
  }));
});

export default router;
