"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface Field {
  id: string; type: string; name: string; label: string
  placeholder?: string; helpText?: string; required: boolean
  options?: { values: string[] }; hidden?: boolean
}

interface PublicFormProps {
  formId: string; formVersionId: string; title: string; description?: string
  fields: Field[]; ctaText: string; thankYouTitle: string; thankYouBody: string
  brandColor?: string
}

function getUtm() {
  if (typeof window === "undefined") return {}
  const p = new URLSearchParams(window.location.search)
  return { source: p.get("utm_source"), medium: p.get("utm_medium"), campaign: p.get("utm_campaign"), term: p.get("utm_term"), content: p.get("utm_content") }
}

export function PublicForm({ formId, formVersionId, title, description, fields, ctaText, thankYouTitle, thankYouBody }: PublicFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true); setError("")
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId, formVersionId, data, utm: getUtm(),
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      })
      if (res.ok) setSubmitted(true)
      else setError("Submission failed. Please try again.")
    } catch { setError("Network error. Please try again.") }
    finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">{thankYouTitle}</h2>
          <p className="text-muted-foreground">{thankYouBody}</p>
        </CardContent>
      </Card>
    )
  }

  const visibleFields = fields.filter(f => !f.hidden)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {visibleFields.map(field => {
            const registration = register(field.name, {
              required: field.required ? `${field.label} is required` : false,
              validate: field.type === "PHONE"
                ? (value: string) => value === "" || /^\d{10}$/.test(value) || "Enter a valid 10-digit phone number"
                : undefined,
            })

            return (
            <div key={field.id} className="space-y-1">
              {field.type !== "CONSENT" && (
                <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
              )}
              {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

              {["TEXT", "EMAIL", "PHONE", "NUMBER", "URL"].includes(field.type) && (
                <Input id={field.name} type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "NUMBER" ? "number" : field.type === "URL" ? "url" : "text"}
                  placeholder={field.placeholder}
                  inputMode={field.type === "PHONE" ? "numeric" : undefined}
                  maxLength={field.type === "PHONE" ? 10 : undefined}
                  {...registration}
                  onChange={event => {
                    if (field.type === "PHONE") {
                      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10)
                    }
                    void registration.onChange(event)
                  }} />
              )}
              {field.type === "TEXTAREA" && (
                <Textarea id={field.name} placeholder={field.placeholder} rows={4}
                  {...register(field.name, { required: field.required ? `${field.label} is required` : false })} />
              )}
              {field.type === "DATE" && (
                <Input id={field.name} type="date"
                  {...register(field.name, { required: field.required ? `${field.label} is required` : false })} />
              )}
              {field.type === "DROPDOWN" && (
                <select id={field.name} className="w-full h-10 border rounded-md px-3 text-sm bg-background"
                  {...register(field.name, { required: field.required ? `${field.label} is required` : false })}>
                  <option value="">Select an option</option>
                  {(field.options?.values ?? []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              )}
              {field.type === "RADIO" && (
                <div className="space-y-2">
                  {(field.options?.values ?? []).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input type="radio" value={opt} {...register(field.name, { required: field.required ? `${field.label} is required` : false })} />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
              {field.type === "CHECKBOX" && (
                <div className="space-y-2">
                  {(field.options?.values ?? []).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" value={opt} {...register(field.name)} />{opt}
                    </label>
                  ))}
                </div>
              )}
              {field.type === "CONSENT" && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5"
                    {...register(field.name, { required: field.required ? "You must accept to continue" : false })} />
                  <span>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</span>
                </label>
              )}
              {(errors[field.name] as any)?.message && (
                <p className="text-xs text-destructive">{(errors[field.name] as any).message}</p>
              )}
            </div>
            )
          })}

          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : ctaText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
