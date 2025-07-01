"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Search, Filter, Navigation, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"
import CryptoJS from "crypto-js"

interface POI {
  _id: string
  encryptedName: string
  encryptedLat: string
  encryptedLon: string
  category: string
  createdBy: string
  createdAt: string
}

interface DecryptedPOI {
  id: string
  name: string
  lat: number
  lon: number
  category: string
  distance: number
  createdAt: string
}

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "saferadius-secret-key-2024"

export default function UserDashboard() {
  const [location, setLocation] = useState({ lat: "", lon: "" })
  const [radius, setRadius] = useState("5")
  const [category, setCategory] = useState("all")
  const [pois, setPois] = useState<DecryptedPOI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const categories = [
    "all",
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

  const decryptData = (encryptedData: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error("Decryption error:", error)
      return ""
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude.toString(),
          lon: position.coords.longitude.toString(),
        })
        toast({
          title: "Location obtained",
          description: "Your current location has been set.",
        })
        setIsGettingLocation(false)
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your location. Please enter manually.",
          variant: "destructive",
        })
        setIsGettingLocation(false)
      },
    )
  }

  const searchPOIs = async () => {
    if (!location.lat || !location.lon) {
      toast({
        title: "Location required",
        description: "Please enter your location or use GPS.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/poi/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          category: category === "all" ? undefined : category,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const userLat = Number.parseFloat(location.lat)
        const userLon = Number.parseFloat(location.lon)
        const radiusKm = Number.parseFloat(radius)

        const decryptedPOIs: DecryptedPOI[] = data.pois
          .map((poi: POI) => {
            const name = decryptData(poi.encryptedName)
            const lat = Number.parseFloat(decryptData(poi.encryptedLat))
            const lon = Number.parseFloat(decryptData(poi.encryptedLon))

            if (!name || isNaN(lat) || isNaN(lon)) return null

            const distance = calculateDistance(userLat, userLon, lat, lon)

            return {
              id: poi._id,
              name,
              lat,
              lon,
              category: poi.category,
              distance,
              createdAt: poi.createdAt,
            }
          })
          .filter((poi: DecryptedPOI | null) => poi !== null && poi.distance <= radiusKm)
          .sort((a: DecryptedPOI, b: DecryptedPOI) => a.distance - b.distance)

        setPois(decryptedPOIs)
        toast({
          title: "Search completed",
          description: `Found ${decryptedPOIs.length} POIs within ${radius}km.`,
        })
      } else {
        toast({
          title: "Search failed",
          description: data.message || "Unable to search POIs.",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          </div>
          <p className="text-gray-400 mb-8">Discover nearby points of interest while keeping your location private.</p>
        </motion.div>

        {/* Search Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-cyan-400" />
                <span>Search Parameters</span>
              </CardTitle>
              <CardDescription>Set your location and search preferences to find nearby POIs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="Enter latitude"
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="Enter longitude"
                    value={location.lon}
                    onChange={(e) => setLocation({ ...location, lon: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 focus:border-cyan-400"
                  />
                </div>
              </div>

              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isGettingLocation ? "Getting Location..." : "Use Current Location"}
              </Button>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">Search Radius (km)</Label>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 focus:border-cyan-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="2">2 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 focus:border-cyan-400">
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

              <Button
                onClick={searchPOIs}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-semibold"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search POIs"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {pois.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <span>Nearby POIs ({pois.length})</span>
                </CardTitle>
                <CardDescription>Points of interest within {radius}km of your location.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pois.map((poi) => (
                    <div
                      key={poi.id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-cyan-400 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{poi.name}</h3>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                          {poi.distance.toFixed(2)} km
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Filter className="h-4 w-4" />
                          <span>{poi.category.replace("_", " ")}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
