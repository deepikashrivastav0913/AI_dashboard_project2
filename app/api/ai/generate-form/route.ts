import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIp } from "@/lib/rbac"
import { generateFormSchema } from "@/lib/ai"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req)
  if (error) return error

  const ip = getClientIp(req)
  if (!rateLimit(`ai:${ip}`, 10, 60_000)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

  const { prompt } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt is required" }, { status: 400 })

  const schema = await generateFormSchema(prompt)
  return NextResponse.json(schema)
}
