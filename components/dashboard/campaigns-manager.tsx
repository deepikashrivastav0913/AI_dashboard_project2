"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  brandId: z.string().min(1),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Campaign { id: string; name: string; slug: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; active: boolean; brand: { name: string }; _count: { forms: number } }

export function CampaignsManager({ campaigns: initial, brands }: { campaigns: Campaign[]; brands: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [campaigns, setCampaigns] = useState(initial)
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) {
      const c = await res.json()
      const brand = brands.find(b => b.id === data.brandId)
      setCampaigns([{ ...c, brand: { name: brand?.name ?? "" }, _count: { forms: 0 } }, ...campaigns])
      reset(); setOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input {...register("name")} placeholder="iX3 Launch 2024" /></div>
            <div className="space-y-1"><Label>Slug</Label><Input {...register("slug")} placeholder="ix3-launch-2024" />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            <div className="space-y-1">
              <Label>Brand</Label>
              <Select onValueChange={v => setValue("brandId", v)}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-xs">UTM Source</Label><Input {...register("utmSource")} placeholder="website" className="h-8 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">UTM Medium</Label><Input {...register("utmMedium")} placeholder="form" className="h-8 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">UTM Campaign</Label><Input {...register("utmCampaign")} placeholder="ix3-launch" className="h-8 text-sm" /></div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>Create Campaign</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {campaigns.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.brand.name} · /{c.slug} · {c._count.forms} forms</p>
                <div className="flex gap-1 mt-1">
                  {c.utmSource && <Badge variant="outline" className="text-xs">src: {c.utmSource}</Badge>}
                  {c.utmMedium && <Badge variant="outline" className="text-xs">med: {c.utmMedium}</Badge>}
                  {c.utmCampaign && <Badge variant="outline" className="text-xs">cmp: {c.utmCampaign}</Badge>}
                </div>
              </div>
              <Badge variant={c.active ? "success" : "outline"}>{c.active ? "Active" : "Inactive"}</Badge>
            </CardContent>
          </Card>
        ))}
        {!campaigns.length && <p className="text-muted-foreground">No campaigns yet.</p>}
      </div>
    </div>
  )
}
