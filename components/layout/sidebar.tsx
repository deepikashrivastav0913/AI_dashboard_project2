"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, FileText, BarChart2, Building2, Megaphone, Shield, Settings, LogOut, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/forms", label: "Forms", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/brands", label: "Brands", icon: Building2 },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/audit", label: "Audit Logs", icon: Shield, adminOnly: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface SidebarProps { user: { name?: string; email?: string; role?: string } }

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">FormAI</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && user.role !== "ADMIN") return null
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="mt-1 text-xs">{user.role}</Badge>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </aside>
  )
}
