"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  primaryColor: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Brand { id: string; name: string; slug: string; primaryColor?: string; _count: { forms: number; campaigns: number }; domains: { domain: string; verified: boolean }[] }

export function BrandsManager({ brands: initial, isAdmin }: { brands: Brand[]; isAdmin: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [brands, setBrands] = useState(initial)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { const brand = await res.json(); setBrands([...brands, { ...brand, _count: { forms: 0, campaigns: 0 }, domains: [] }]); reset(); setOpen(false) }
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Brand</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Brand</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1"><Label>Name</Label><Input {...register("name")} placeholder="BMW Singapore" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
              <div className="space-y-1"><Label>Slug</Label><Input {...register("slug")} placeholder="bmw-sg" />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
              <div className="space-y-1"><Label>Primary Color</Label><Input {...register("primaryColor")} type="color" className="h-10 w-full" /></div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>Create Brand</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <Card key={brand.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: brand.primaryColor ?? "#3b82f6" }}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">{brand.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                <span>{brand._count.forms} forms</span>
                <span>{brand._count.campaigns} campaigns</span>
              </div>
              {brand.domains.map(d => (
                <Badge key={d.domain} variant={d.verified ? "success" : "outline"} className="mr-1 text-xs">{d.domain}</Badge>
              ))}
            </CardContent>
          </Card>
        ))}
        {!brands.length && <p className="text-muted-foreground col-span-3">No brands yet.</p>}
      </div>
    </div>
  )
}
