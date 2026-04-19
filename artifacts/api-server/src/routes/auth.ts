import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, users } from "@workspace/db";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function formatUser(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    memberId: u.memberId,
    staffId: u.staffId,
    createdAt: u.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/auth/users", async (_req, res): Promise<void> => {
  const rows = await db.select().from(users).orderBy(users.role);
  res.json(rows.map(formatUser));
});

const CreateUserBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  fullName: z.string().min(1),
  role: z.string().min(1),
  memberId: z.number().nullable().optional(),
  staffId: z.number().nullable().optional(),
});

router.post("/auth/users", async (req, res): Promise<void> => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const { username, password, fullName, role, memberId, staffId } = body.data;
  const [row] = await db
    .insert(users)
    .values({
      username,
      passwordHash: hashPassword(password),
      fullName,
      role,
      memberId: memberId ?? null,
      staffId: staffId ?? null,
    })
    .returning();
  res.status(201).json(formatUser(row));
});

const LoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const body = LoginBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const { username, password } = body.data;
  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  res.json({
    user: formatUser(user),
    token: Buffer.from(`${user.id}:${user.role}`).toString("base64"),
  });
});

export default router;
