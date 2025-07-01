"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, MapPin, Lock, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-xl font-bold neon-text">SafeRadius</span>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
                className="text-gray-300 hover:text-white"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/auth/register")}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Discover what's</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                near you — privately
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              SafeRadius is a secure geolocation service that helps you find nearby points of interest while keeping
              your location data encrypted and private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/auth/register")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-semibold px-8 py-3 text-lg neon-glow"
              >
                Start Exploring
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-3 text-lg"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose SafeRadius?</h2>
            <p className="text-xl text-gray-300">Privacy-first location discovery with enterprise-grade security</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 card-hover">
                <CardHeader>
                  <Lock className="h-12 w-12 text-green-400 mb-4" />
                  <CardTitle className="text-xl">End-to-End Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    All location data is encrypted before storage and only decrypted on your device, ensuring maximum
                    privacy protection.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 card-hover">
                <CardHeader>
                  <MapPin className="h-12 w-12 text-purple-400 mb-4" />
                  <CardTitle className="text-xl">Smart Location Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Find nearby points of interest within your specified radius using advanced geolocation algorithms
                    and real-time data.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 card-hover">
                <CardHeader>
                  <Users className="h-12 w-12 text-cyan-400 mb-4" />
                  <CardTitle className="text-xl">Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Secure multi-role system for users, POI owners, and administrators with granular permission
                    controls.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Ready to Explore Safely?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust SafeRadius for secure location discovery.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/auth/register")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-12 py-4 text-lg neon-glow"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-cyan-400" />
            <span className="text-lg font-semibold">SafeRadius</span>
          </div>
          <p className="text-gray-400">© 2024 SafeRadius. Discover what's near you — privately.</p>
        </div>
      </footer>
    </div>
  )
}
