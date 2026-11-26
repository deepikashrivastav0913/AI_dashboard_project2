import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIp } from "@/lib/rbac"
import { generateContent } from "@/lib/ai"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req)
  if (error) return error

  const ip = getClientIp(req)
  if (!rateLimit(`ai-content:${ip}`, 20, 60_000)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

  const { type, context } = await req.json()
  if (!type || !context) return NextResponse.json({ error: "type and context are required" }, { status: 400 })

  const content = await generateContent(type, context)
  return NextResponse.json({ content })
}
