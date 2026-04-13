import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, workoutPlansTable, staffTable, membersTable } from "@workspace/db";
import {
  ListWorkoutsQueryParams,
  ListWorkoutsResponse,
  CreateWorkoutBody,
  GetWorkoutParams,
  GetWorkoutResponse,
  UpdateWorkoutParams,
  UpdateWorkoutBody,
  UpdateWorkoutResponse,
  DeleteWorkoutParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function workoutWithNames(workout: typeof workoutPlansTable.$inferSelect) {
  const [trainer] = await db.select().from(staffTable).where(eq(staffTable.id, workout.trainerId));
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, workout.memberId));
  return {
    ...workout,
    trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : null,
    memberName: member ? `${member.firstName} ${member.lastName}` : null,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
  };
}

router.get("/workouts", async (req, res): Promise<void> => {
  const query = ListWorkoutsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.trainerId) conditions.push(eq(workoutPlansTable.trainerId, query.data.trainerId));
  if (query.data.memberId) conditions.push(eq(workoutPlansTable.memberId, query.data.memberId));

  const workouts = await db.select().from(workoutPlansTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const result = await Promise.all(workouts.map(workoutWithNames));
  res.json(ListWorkoutsResponse.parse(result));
});

router.post("/workouts", async (req, res): Promise<void> => {
  const parsed = CreateWorkoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [workout] = await db.insert(workoutPlansTable).values(parsed.data).returning();
  res.status(201).json(GetWorkoutResponse.parse(await workoutWithNames(workout)));
});

router.get("/workouts/:id", async (req, res): Promise<void> => {
  const params = GetWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [workout] = await db.select().from(workoutPlansTable).where(eq(workoutPlansTable.id, params.data.id));

  if (!workout) {
    res.status(404).json({ error: "Workout plan not found" });
    return;
  }

  res.json(GetWorkoutResponse.parse(await workoutWithNames(workout)));
});

router.patch("/workouts/:id", async (req, res): Promise<void> => {
  const params = UpdateWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateWorkoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [workout] = await db
    .update(workoutPlansTable)
    .set(parsed.data)
    .where(eq(workoutPlansTable.id, params.data.id))
    .returning();

  if (!workout) {
    res.status(404).json({ error: "Workout plan not found" });
    return;
  }

  res.json(UpdateWorkoutResponse.parse(await workoutWithNames(workout)));
});

router.delete("/workouts/:id", async (req, res): Promise<void> => {
  const params = DeleteWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [workout] = await db
    .delete(workoutPlansTable)
    .where(eq(workoutPlansTable.id, params.data.id))
    .returning();

  if (!workout) {
    res.status(404).json({ error: "Workout plan not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
