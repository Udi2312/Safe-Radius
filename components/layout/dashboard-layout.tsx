"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, LogOut, User, Building, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return <Settings className="h-5 w-5 text-red-400" />
      case "owner":
        return <Building className="h-5 w-5 text-purple-400" />
      default:
        return <User className="h-5 w-5 text-cyan-400" />
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case "admin":
        return "text-red-400"
      case "owner":
        return "text-purple-400"
      default:
        return "text-cyan-400"
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-cyan-400" />
                <span className="text-xl font-bold neon-text">SafeRadius</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-full">
                {getRoleIcon()}
                <span className={`text-sm font-medium ${getRoleColor()}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-400 hover:text-white hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
