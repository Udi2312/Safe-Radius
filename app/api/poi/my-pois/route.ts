export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
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

    // Check if user has owner or admin role
    if (!["owner", "admin"].includes(decoded.role)) {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 })
    }

    await connectDB()

    // Fetch user's POIs (unencrypted data for owner)
    const pois = await POI.find({ createdBy: decoded.userId })
      .select("name address area city pinCode category createdAt")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      message: "POIs retrieved successfully",
      pois,
    })
  } catch (error) {
    console.error("Get my POIs error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
