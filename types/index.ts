import { FieldType, FormStatus, UserRole } from "@prisma/client"

export type { FieldType, FormStatus, UserRole }

export interface FieldSchema {
  id?: string
  type: FieldType
  name: string
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  order: number
  options?: { values: string[] }
  validation?: Record<string, unknown>
  defaultValue?: string
  hidden?: boolean
}

export interface FormVersionSchema {
  id?: string
  version: number
  status: FormStatus
  fields: FieldSchema[]
  ctaText?: string
  thankYouTitle?: string
  thankYouBody?: string
  seoTitle?: string
  seoDescription?: string
}

export interface DashboardStats {
  totalForms: number
  publishedForms: number
  totalSubmissions: number
  submissionsToday: number
  conversionRate: number
}

export interface SubmissionWithData {
  id: string
  createdAt: Date
  data: Record<string, unknown>
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
}
