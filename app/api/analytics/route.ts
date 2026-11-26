import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/rbac"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const formId = searchParams.get("formId")
  const days = parseInt(searchParams.get("days") ?? "30")

  const since = new Date()
  since.setDate(since.getDate() - days)

  const where = { createdAt: { gte: since }, ...(formId ? { formId } : {}) }

  const [submissions, byForm, byUtmSource] = await Promise.all([
    prisma.submission.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.submission.groupBy({ by: ["formId"], where, _count: { id: true } }),
    prisma.submission.groupBy({ by: ["utmSource"], where, _count: { id: true } }),
  ])

  // Daily trend
  const dailyMap = new Map<string, number>()
  for (const s of submissions) {
    const day = s.createdAt.toISOString().slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
  }
  const trend = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }))

  // Enrich byForm with titles
  const formIds = byForm.map(f => f.formId)
  const forms = await prisma.form.findMany({ where: { id: { in: formIds } }, select: { id: true, title: true } })
  const formMap = Object.fromEntries(forms.map(f => [f.id, f.title]))
  const formStats = byForm.map(f => ({ formId: f.formId, title: formMap[f.formId] ?? "Unknown", count: f._count.id }))

  const utmStats = byUtmSource.map(u => ({ source: u.utmSource ?? "direct", count: u._count.id }))

  return NextResponse.json({ trend, formStats, utmStats, total: submissions.length })
}
