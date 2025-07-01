"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, MapPin, Building, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface POIFormData {
  name: string
  address: string
  area: string
  city: string
  pinCode: string
  category: string
}

interface MyPOI {
  _id: string
  name: string
  address: string
  area: string
  city: string
  pinCode: string
  category: string
  createdAt: string
}

export default function OwnerDashboard() {
  const [formData, setFormData] = useState<POIFormData>({
    name: "",
    address: "",
    area: "",
    city: "",
    pinCode: "",
    category: "other",
  })
  const [myPOIs, setMyPOIs] = useState<MyPOI[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const categories = [
    "restaurant",
    "cafe",
    "gym",
    "hospital",
    "school",
    "park",
    "shopping",
    "gas_station",
    "bank",
    "pharmacy",
    "other",
  ]

  useEffect(() => {
    fetchMyPOIs()
  }, [])

  const fetchMyPOIs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/poi/my-pois", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMyPOIs(data.pois)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch your POIs.",
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
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/poi/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "POI added successfully!",
          description: "Your point of interest has been added and encrypted.",
        })
        setFormData({
          name: "",
          address: "",
          area: "",
          city: "",
          pinCode: "",
          category: "other",
        })
        fetchMyPOIs() // Refresh the list
      } else {
        toast({
          title: "Failed to add POI",
          description: data.message || "Something went wrong.",
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
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof POIFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center space-x-2 mb-6">
            <Building className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">POI Owner Dashboard</h1>
          </div>
          <p className="text-gray-400 mb-8">
            Add and manage your points of interest. All data is encrypted for privacy.
          </p>
        </motion.div>

        {/* Add POI Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-400" />
                <span>Add New POI</span>
              </CardTitle>
              <CardDescription>
                Enter the details of your point of interest. Location coordinates will be fetched automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Place Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Joe's Coffee Shop"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-gray-700/50 border-gray-600 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 focus:border-purple-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="e.g., 123 Main Street"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    className="bg-gray-700/50 border-gray-600 focus:border-purple-400"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area/Locality *</Label>
                    <Input
                      id="area"
                      type="text"
                      placeholder="e.g., Downtown"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      required
                      className="bg-gray-700/50 border-gray-600 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="e.g., New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                      className="bg-gray-700/50 border-gray-600 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinCode">Pin Code *</Label>
                    <Input
                      id="pinCode"
                      type="text"
                      placeholder="e.g., 10001"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange("pinCode", e.target.value)}
                      required
                      className="bg-gray-700/50 border-gray-600 focus:border-purple-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding POI..." : "Add POI"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* My POIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5 text-cyan-400" />
                <span>My POIs ({myPOIs.length})</span>
              </CardTitle>
              <CardDescription>Points of interest you've added to SafeRadius.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading your POIs...</p>
                </div>
              ) : myPOIs.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No POIs added yet. Add your first POI above!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myPOIs.map((poi) => (
                    <div key={poi._id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{poi.name}</h3>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                          {poi.category.replace("_", " ")}
                        </Badge>
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
