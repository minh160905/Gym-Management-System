import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import membershipsRouter from "./memberships";
import staffRouter from "./staff";
import classesRouter from "./classes";
import bookingsRouter from "./bookings";
import sessionsRouter from "./sessions";
import workoutsRouter from "./workouts";
import attendanceRouter from "./attendance";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(membershipsRouter);
router.use(staffRouter);
router.use(classesRouter);
router.use(bookingsRouter);
router.use(sessionsRouter);
router.use(workoutsRouter);
router.use(attendanceRouter);
router.use(analyticsRouter);

export default router;
