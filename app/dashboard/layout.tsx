"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, BookOpen, Brain, BarChart3, Bell, User, Flame, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navigation = [
  { title: "Dashboard", icon: BarChart3, href: "/dashboard", badge: null },
  { title: "Study", icon: Brain, href: "/dashboard/study", badge: null },
  { title: "Topics", icon: BookOpen, href: "/dashboard/topics", badge: null },
  { title: "Calendar", icon: Calendar, href: "/dashboard/calendar", badge: null },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Brain className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-gray-900">StudyMaster</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{profile?.study_streak || 0} day streak</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium">{profile?.full_name || "User"}</div>
                        <div className="text-muted-foreground">{user?.email}</div>
                      </div>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
