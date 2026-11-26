"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const profileSchema = z.object({ name: z.string().min(1) })
const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] })

export function SettingsForm({ user }: { user: { name?: string; email?: string; role?: string } }) {
  const [profileMsg, setProfileMsg] = useState("")
  const [pwMsg, setPwMsg] = useState("")

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? "" } })
  const pwForm = useForm({ resolver: zodResolver(passwordSchema) })

  const updateProfile = async (data: any) => {
    const res = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    setProfileMsg(res.ok ? "Profile updated" : "Update failed")
  }

  const updatePassword = async (data: any) => {
    const res = await fetch("/api/users/me/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    setPwMsg(res.ok ? "Password updated" : "Update failed")
    if (res.ok) pwForm.reset()
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <div><Badge>{user?.role}</Badge></div>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...profileForm.register("name")} />
            </div>
            {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(updatePassword)} className="space-y-4">
            <div className="space-y-1"><Label>Current Password</Label><Input type="password" {...pwForm.register("currentPassword")} /></div>
            <div className="space-y-1"><Label>New Password</Label><Input type="password" {...pwForm.register("newPassword")} />{pwForm.formState.errors.newPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message as string}</p>}</div>
            <div className="space-y-1"><Label>Confirm Password</Label><Input type="password" {...pwForm.register("confirmPassword")} />{pwForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message as string}</p>}</div>
            {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
            <Button type="submit" disabled={pwForm.formState.isSubmitting}>Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
