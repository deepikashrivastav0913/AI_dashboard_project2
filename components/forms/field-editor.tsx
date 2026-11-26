"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Trash2, Settings2, GripVertical } from "lucide-react"
import type { FieldSchema } from "@/types"

interface FieldEditorProps {
  field: FieldSchema
  index: number
  total: number
  onChange: (field: FieldSchema) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

export function FieldEditor({ field, index, total, onChange, onRemove, onMove }: FieldEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const hasOptions = ["DROPDOWN", "RADIO", "CHECKBOX"].includes(field.type)

  return (
    <div className="border rounded-lg p-3 bg-background">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        <Badge variant="outline" className="text-xs shrink-0">{field.type}</Badge>
        <span className="font-medium text-sm flex-1 truncate">{field.label}</span>
        {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(-1)} disabled={index === 0}><ChevronUp className="h-3 w-3" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(1)} disabled={index === total - 1}><ChevronDown className="h-3 w-3" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}><Settings2 className="h-3 w-3" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input value={field.label} onChange={e => onChange({ ...field, label: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Field Name</Label>
            <Input value={field.name} onChange={e => onChange({ ...field, name: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Placeholder</Label>
            <Input value={field.placeholder ?? ""} onChange={e => onChange({ ...field, placeholder: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Help Text</Label>
            <Input value={field.helpText ?? ""} onChange={e => onChange({ ...field, helpText: e.target.value })} className="h-8 text-sm" />
          </div>
          {hasOptions && (
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Options (one per line)</Label>
              <textarea
                className="w-full h-20 text-sm border rounded p-2 resize-none"
                value={(field.options?.values ?? []).join("\n")}
                onChange={e => onChange({ ...field, options: { values: e.target.value.split("\n").filter(Boolean) } })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id={`req-${field.name}`} checked={field.required} onChange={e => onChange({ ...field, required: e.target.checked })} />
            <Label htmlFor={`req-${field.name}`} className="text-xs">Required field</Label>
            <input type="checkbox" id={`hid-${field.name}`} checked={field.hidden ?? false} onChange={e => onChange({ ...field, hidden: e.target.checked })} className="ml-4" />
            <Label htmlFor={`hid-${field.name}`} className="text-xs">Hidden field</Label>
          </div>
        </div>
      )}
    </div>
  )
}
