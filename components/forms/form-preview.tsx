"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { FieldSchema } from "@/types"

interface FormPreviewProps {
  fields: FieldSchema[]
  ctaText: string
  title?: string
  description?: string
}

export function FormPreview({ fields, ctaText, title, description }: FormPreviewProps) {
  const visibleFields = fields.filter(f => !f.hidden)

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{title || "Form Preview"}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleFields.map((field, i) => (
          <div key={i} className="space-y-1">
            <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {["TEXT", "EMAIL", "PHONE", "NUMBER", "URL"].includes(field.type) && (
              <Input type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "NUMBER" ? "number" : field.type === "URL" ? "url" : "text"} placeholder={field.placeholder} disabled />
            )}
            {field.type === "TEXTAREA" && <Textarea placeholder={field.placeholder} disabled rows={3} />}
            {field.type === "DATE" && <Input type="date" disabled />}
            {field.type === "DROPDOWN" && (
              <select className="w-full h-10 border rounded-md px-3 text-sm bg-background" disabled>
                <option value="">Select an option</option>
                {(field.options?.values ?? []).map((opt, j) => <option key={j}>{opt}</option>)}
              </select>
            )}
            {field.type === "RADIO" && (
              <div className="space-y-1">
                {(field.options?.values ?? []).map((opt, j) => (
                  <label key={j} className="flex items-center gap-2 text-sm"><input type="radio" disabled />{opt}</label>
                ))}
              </div>
            )}
            {field.type === "CHECKBOX" && (
              <div className="space-y-1">
                {(field.options?.values ?? []).map((opt, j) => (
                  <label key={j} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled />{opt}</label>
                ))}
              </div>
            )}
            {field.type === "CONSENT" && (
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5" disabled />{field.label}</label>
            )}
          </div>
        ))}
        {visibleFields.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Add fields to see preview</p>}
        {visibleFields.length > 0 && <Button className="w-full" disabled>{ctaText}</Button>}
      </CardContent>
    </Card>
  )
}
