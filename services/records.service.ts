import "server-only";
import { db } from "@/db";
import { projectRecords } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { RecordFormInput } from "@/lib/validators";

export async function getAllRecords() {
  return db.query.projectRecords.findMany({
    orderBy: [desc(projectRecords.createdAt)],
    with: { assignedStaff: true },
  });
}

export async function getRecordById(id: number) {
  return db.query.projectRecords.findFirst({
    where: eq(projectRecords.id, id),
    with: { assignedStaff: true },
  });
}

function toValues(input: RecordFormInput) {
  return {
    name: input.name,
    client: input.client,
    category: input.category,
    status: input.status,
    startDate: input.startDate ? new Date(input.startDate) : null,
    completionDate: input.completionDate ? new Date(input.completionDate) : null,
    quotedAmount: input.quotedAmount.toString(),
    totalIncome: input.totalIncome.toString(),
    deposit: input.deposit.toString(),
    remainingAmount: input.remainingAmount.toString(),
    expenses: input.expenses.toString(),
    technologies: input.technologies || null,
    assignedStaffId: input.assignedStaffId ?? null,
    clientContactName: input.clientContactName || null,
    clientContactEmail: input.clientContactEmail || null,
    clientContactPhone: input.clientContactPhone || null,
    notes: input.notes || null,
    internalNotes: input.internalNotes || null,
  };
}

export async function createRecord(input: RecordFormInput) {
  const [created] = await db.insert(projectRecords).values(toValues(input)).returning({ id: projectRecords.id });
  return created.id;
}

export async function updateRecord(id: number, input: RecordFormInput) {
  await db
    .update(projectRecords)
    .set({ ...toValues(input), updatedAt: new Date() })
    .where(eq(projectRecords.id, id));
}

export async function deleteRecord(id: number) {
  await db.delete(projectRecords).where(eq(projectRecords.id, id));
}

export async function getFinancialSummary() {
  const rows = await db.select().from(projectRecords);

  const totalProjects = rows.length;
  const completed = rows.filter((r) => r.status === "COMPLETED").length;
  const active = rows.filter((r) => r.status === "IN_PROGRESS" || r.status === "REVIEW").length;
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.totalIncome), 0);
  const totalExpenses = rows.reduce((sum, r) => sum + Number(r.expenses), 0);
  const netProfit = totalRevenue - totalExpenses;
  const averageProjectValue = totalProjects ? totalRevenue / totalProjects : 0;

  const byCategory = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({ category, count }));

  const byStatus = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const revenueByMonth = Object.entries(
    rows.reduce<Record<string, { revenue: number; expenses: number }>>((acc, r) => {
      const key = (r.completionDate ?? r.startDate ?? r.createdAt)
        .toISOString()
        .slice(0, 7); // YYYY-MM
      acc[key] = acc[key] ?? { revenue: 0, expenses: 0 };
      acc[key].revenue += Number(r.totalIncome);
      acc[key].expenses += Number(r.expenses);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));

  return {
    totalProjects,
    completed,
    active,
    totalRevenue,
    totalExpenses,
    netProfit,
    averageProjectValue,
    byCategory,
    byStatus,
    revenueByMonth,
  };
}
