export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import POI from "@/models/POI"

const JWT_SECRET = process.env.JWT_SECRET || "saferadius-jwt-secret-2024"

interface DecodedToken {
  userId: string
  email: string
  role: string
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: DecodedToken

    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user has admin role
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get statistics
    const [totalUsers, totalOwners, totalPOIs, recentPOIs] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      POI.countDocuments(),
      POI.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ])

    const stats = {
      totalUsers,
      totalOwners,
      totalPOIs,
      recentActivity: recentPOIs,
    }

    return NextResponse.json({
      message: "Stats retrieved successfully",
      stats,
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
