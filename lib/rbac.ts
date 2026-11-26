import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { NextRequest, NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function requireAuth(req?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null }
  return { error: null, session }
}

export async function requireAdmin(req?: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return { error, session: null }
  if ((session!.user as any).role !== UserRole.ADMIN)
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null }
  return { error: null, session }
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown"
}
