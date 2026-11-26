"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FieldEditor } from "./field-editor"
import { FormPreview } from "./form-preview"
import { Plus, Sparkles, Eye, Save, Globe, Archive } from "lucide-react"
import type { FieldSchema } from "@/types"
import { FieldType } from "@prisma/client"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  campaignId: z.string().optional(),
  ctaText: z.string().optional(),
  thankYouTitle: z.string().optional(),
  thankYouBody: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface FormBuilderProps {
  brands: { id: string; name: string; slug: string }[]
  campaigns: { id: string; name: string; brandId: string; brand: { name: string } }[]
  form?: any
}

export function FormBuilder({ brands, campaigns, form }: FormBuilderProps) {
  const router = useRouter()
  const [fields, setFields] = useState<FieldSchema[]>(form?.versions?.[0]?.fields ?? [])
  const [activeTab, setActiveTab] = useState<"build" | "content" | "preview">("build")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: form?.title ?? "",
      slug: form?.slug ?? "",
      description: form?.description ?? "",
      brandId: form?.brandId ?? "",
      campaignId: form?.campaignId ?? "",
      ctaText: form?.versions?.[0]?.ctaText ?? "Submit",
      thankYouTitle: form?.versions?.[0]?.thankYouTitle ?? "Thank You!",
      thankYouBody: form?.versions?.[0]?.thankYouBody ?? "Your submission has been received.",
      seoTitle: form?.versions?.[0]?.seoTitle ?? "",
      seoDescription: form?.versions?.[0]?.seoDescription ?? "",
    },
  })

  const selectedBrandId = watch("brandId")
  const filteredCampaigns = campaigns.filter(c => c.brandId === selectedBrandId)

  const addField = (type: FieldType) => {
    const newField: FieldSchema = {
      type,
      name: `field_${Date.now()}`,
      label: type.charAt(0) + type.slice(1).toLowerCase(),
      required: false,
      order: fields.length + 1,
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updated: FieldSchema) => {
    const next = [...fields]
    next[index] = updated
    setFields(next)
  }

  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index))

  const moveField = (index: number, dir: -1 | 1) => {
    const next = [...fields]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setFields(next.map((f, i) => ({ ...f, order: i + 1 })))
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai/generate-form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt }) })
      const data = await res.json()
      if (data.title) setValue("title", data.title)
      if (data.fields) setFields(data.fields)
    } catch (e) { console.error(e) }
    finally { setAiLoading(false) }
  }

  const save = async (data: FormData, status?: string) => {
    setSaving(true)
    setSaveError("")
    try {
      const payload = { ...data, fields, status }
      const url = form ? `/api/forms/${form.id}` : "/api/forms"
      const method = form ? "PUT" : "POST"
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      let result: { id?: string; error?: unknown }
      try {
        result = await response.json()
      } catch {
        throw new Error("The server returned an invalid response while saving the form.")
      }

      if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : "Unable to save the form."
        throw new Error(message)
      }
      if (!result.id) throw new Error("The server did not return the saved form ID.")
      router.push(`/dashboard/forms/${result.id}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save the form.")
    } finally { setSaving(false) }
  }

  const tabs = [
    { id: "build", label: "Build" },
    { id: "content", label: "Content & SEO" },
    { id: "preview", label: "Preview" },
  ] as const

  const fieldTypes: FieldType[] = ["TEXT", "EMAIL", "PHONE", "DROPDOWN", "RADIO", "CHECKBOX", "DATE", "TEXTAREA", "CONSENT", "NUMBER", "URL", "HIDDEN"]

  return (
    <form onSubmit={handleSubmit(d => save(d))}>
      <div className="flex gap-6">
        {/* Left Panel */}
        <div className="w-80 space-y-4 shrink-0">
          <Card>
            <CardHeader><CardTitle className="text-base">Form Settings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input {...register("title")} placeholder="Form title" onChange={e => { register("title").onChange(e); if (!form) setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) }} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Slug *</Label>
                <Input {...register("slug")} placeholder="form-slug" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Brand *</Label>
                <Select onValueChange={v => setValue("brandId", v)} defaultValue={form?.brandId}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
              </div>
              {filteredCampaigns.length > 0 && (
                <div className="space-y-1">
                  <Label>Campaign</Label>
                  <Select onValueChange={v => setValue("campaignId", v)} defaultValue={form?.campaignId ?? ""}>
                    <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                    <SelectContent>{filteredCampaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea {...register("description")} placeholder="Form description" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Generate</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe your form... e.g. 'Test drive booking form for BMW iX3'" rows={3} />
              <Button type="button" variant="outline" className="w-full" onClick={generateWithAI} disabled={aiLoading}>
                {aiLoading ? "Generating..." : "Generate Form"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Add Field</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                {fieldTypes.map(type => (
                  <Button key={type} type="button" variant="outline" size="sm" className="text-xs justify-start" onClick={() => addField(type)}>
                    <Plus className="h-3 w-3 mr-1" />{type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Panel */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 border rounded-lg p-1">
              {tabs.map(t => (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {form && <Badge variant={form.status === "PUBLISHED" ? "success" : "warning"}>{form.status}</Badge>}
              <Button type="submit" variant="outline" size="sm" disabled={saving}><Save className="h-4 w-4 mr-1" />Save Draft</Button>
              <Button type="button" size="sm" disabled={saving} onClick={handleSubmit(d => save(d, "PUBLISHED"))}><Globe className="h-4 w-4 mr-1" />Publish</Button>
              {form?.status === "PUBLISHED" && (
                <Button type="button" variant="outline" size="sm" onClick={handleSubmit(d => save(d, "ARCHIVED"))}><Archive className="h-4 w-4 mr-1" />Archive</Button>
              )}
            </div>
          </div>
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}

          {activeTab === "build" && (
            <Card>
              <CardContent className="p-4 space-y-3">
                {fields.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    Add fields from the left panel or use AI to generate a form
                  </div>
                )}
                {fields.map((field, i) => (
                  <FieldEditor key={i} field={field} index={i} total={fields.length}
                    onChange={updated => updateField(i, updated)}
                    onRemove={() => removeField(i)}
                    onMove={dir => moveField(i, dir)} />
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "content" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <Label>CTA Button Text</Label>
                  <Input {...register("ctaText")} placeholder="Submit" />
                </div>
                <div className="space-y-1">
                  <Label>Thank You Title</Label>
                  <Input {...register("thankYouTitle")} placeholder="Thank You!" />
                </div>
                <div className="space-y-1">
                  <Label>Thank You Message</Label>
                  <Textarea {...register("thankYouBody")} placeholder="Your submission has been received." rows={3} />
                </div>
                <hr />
                <div className="space-y-1">
                  <Label>SEO Title</Label>
                  <Input {...register("seoTitle")} placeholder="Page title for search engines" />
                </div>
                <div className="space-y-1">
                  <Label>SEO Description</Label>
                  <Textarea {...register("seoDescription")} placeholder="Meta description" rows={2} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "preview" && (
            <FormPreview fields={fields} ctaText={watch("ctaText") ?? "Submit"} title={watch("title")} description={watch("description")} />
          )}
        </div>
      </div>
    </form>
  )
}
