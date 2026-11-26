import { prisma } from "./prisma"
import { AuditAction } from "@prisma/client"

interface AuditParams {
  userId?: string
  action: AuditAction
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function auditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details as any,
        ipAddress: params.ipAddress,
        userId: params.userId,
      },
    })
  } catch {
    // Non-blocking — audit failures should not break main flow
  }
}
