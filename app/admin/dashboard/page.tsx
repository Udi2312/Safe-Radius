"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Crown, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "owner" | "admin"
  createdAt: string
}

interface AdminStats {
  totalUsers: number
  totalOwners: number
  totalAdmins: number
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOwners: 0,
    totalAdmins: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin, redirect if not
    if (user && user.role !== "admin") {
      router.push("/")
      return
    }

    if (user && user.role === "admin") {
      fetchUsers()
    }
  }, [user, router])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)

        // Calculate stats
        const userCount = data.users.filter((u: User) => u.role === "user").length
        const ownerCount = data.users.filter((u: User) => u.role === "owner").length
        const adminCount = data.users.filter((u: User) => u.role === "admin").length

        setStats({
          totalUsers: userCount,
          totalOwners: ownerCount,
          totalAdmins: adminCount,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users.",
          variant: "destructive",
        })

        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "user" | "owner" | "admin") => {
    setUpdatingUserId(userId)

    try {
      const response = await fetch("/api/admin/update-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId,
          newRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Role updated",
          description: `User role has been updated to ${newRole}.`,
        })
        fetchUsers() // Refresh the user list
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Failed to update user role.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "owner":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    }
  }

  // Show loading if checking auth or fetching data
  if (!user || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Redirect if not admin (this should be handled by useEffect, but as backup)
  if (user.role !== "admin") {
    router.push("/")
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center space-x-2 mb-6">
            <Crown className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 mb-8">Manage users and their roles across the SafeRadius platform.</p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                <div className="flex items-center space-x-1 text-xs text-cyan-300">
                  <Users className="h-3 w-3" />
                  <span>Regular users</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">POI Owners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalOwners}</div>
                <div className="flex items-center space-x-1 text-xs text-purple-300">
                  <Users className="h-3 w-3" />
                  <span>Business accounts</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400">Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalAdmins}</div>
                <div className="flex items-center space-x-1 text-xs text-red-300">
                  <Crown className="h-3 w-3" />
                  <span>Admin accounts</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-yellow-400" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>View and manage user roles across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No users found in the system.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div
                      key={userData._id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-white">{userData.name}</h3>
                            <Badge className={getRoleBadgeColor(userData.role)}>{userData.role.toUpperCase()}</Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{userData.email}</p>
                          <p className="text-gray-500 text-xs">
                            Joined: {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          {userData.role !== "admin" && (
                            <Button
                              size="sm"
                              onClick={() => updateUserRole(userData._id, "admin")}
                              disabled={updatingUserId === userData._id}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              {updatingUserId === userData._id ? "Updating..." : "Promote to Admin"}
                            </Button>
                          )}

                          {userData.role !== "user" && userData._id !== user.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(userData._id, "user")}
                              disabled={updatingUserId === userData._id}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              {updatingUserId === userData._id ? "Updating..." : "Demote to User"}
                            </Button>
                          )}

                          {userData._id === user.id && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
