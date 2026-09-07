import "server-only";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import type { StaffFormInput } from "@/lib/validators";
import type { StaffMember } from "@/models";

function omitPassword(user: typeof users.$inferSelect): StaffMember {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function getAllStaff(): Promise<StaffMember[]> {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map(omitPassword);
}

export async function getStaffById(id: number): Promise<StaffMember | undefined> {
  const row = await db.query.users.findFirst({ where: eq(users.id, id) });
  return row ? omitPassword(row) : undefined;
}

export async function getUserByEmailWithPassword(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
}

export async function createStaff(input: StaffFormInput) {
  if (!input.password) {
    throw new Error("A password is required to create a new staff account.");
  }
  const passwordHash = await hashPassword(input.password);
  const [created] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      title: input.title || null,
      active: input.active,
    })
    .returning({ id: users.id });
  return created.id;
}

export async function updateStaff(id: number, input: StaffFormInput) {
  const values: Partial<typeof users.$inferInsert> = {
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    title: input.title || null,
    active: input.active,
    updatedAt: new Date(),
  };
  if (input.password) {
    values.passwordHash = await hashPassword(input.password);
  }
  await db.update(users).set(values).where(eq(users.id, id));
}

export async function setStaffActive(id: number, active: boolean) {
  await db.update(users).set({ active, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function deleteStaff(id: number) {
  await db.delete(users).where(eq(users.id, id));
}
