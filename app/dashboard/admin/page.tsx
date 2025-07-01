"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Users, MapPin, BarChart3, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface AdminStats {
  totalUsers: number
  totalPOIs: number
  totalOwners: number
  recentActivity: number
}

interface AllPOI {
  _id: string
  name: string
  address: string
  area: string
  city: string
  pinCode: string
  category: string
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPOIs: 0,
    totalOwners: 0,
    recentActivity: 0,
  })
  const [allPOIs, setAllPOIs] = useState<AllPOI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      const [statsResponse, poisResponse] = await Promise.all([
        fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("/api/admin/all-pois", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ])

      const statsData = await statsResponse.json()
      const poisData = await poisResponse.json()

      if (statsResponse.ok) {
        setStats(statsData.stats)
      }

      if (poisResponse.ok) {
        setAllPOIs(poisData.pois)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch admin data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deletePOI = async (poiId: string) => {
    try {
      const response = await fetch(`/api/admin/delete-poi/${poiId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "POI deleted",
          description: "The POI has been successfully deleted.",
        })
        fetchAdminData() // Refresh data
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete the POI.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 mb-8">Monitor and manage the SafeRadius platform.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                <div className="flex items-center space-x-1 text-xs text-blue-300">
                  <Users className="h-3 w-3" />
                  <span>Active accounts</span>
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

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Total POIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalPOIs}</div>
                <div className="flex items-center space-x-1 text-xs text-green-300">
                  <MapPin className="h-3 w-3" />
                  <span>Points of interest</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-400">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.recentActivity}</div>
                <div className="flex items-center space-x-1 text-xs text-cyan-300">
                  <BarChart3 className="h-3 w-3" />
                  <span>Last 7 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* All POIs Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-yellow-400" />
                <span>All POIs Management</span>
              </CardTitle>
              <CardDescription>View and manage all points of interest in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading POIs...</p>
                </div>
              ) : allPOIs.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No POIs found in the system.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allPOIs.map((poi) => (
                    <div key={poi._id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{poi.name}</h3>
                          <p className="text-sm text-gray-400">
                            by {poi.createdBy.name} ({poi.createdBy.email})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                            {poi.category.replace("_", " ")}
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePOI(poi._id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>{poi.address}</p>
                        <p>
                          {poi.area}, {poi.city} - {poi.pinCode}
                        </p>
                        <p className="text-xs">Added on {new Date(poi.createdAt).toLocaleDateString()}</p>
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
