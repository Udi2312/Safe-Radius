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

export async function POST(request: NextRequest) {
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

    const { category } = await request.json()

    await connectDB()

    // Build query
    const query: any = {}
    if (category) {
      query.category = category
    }

    // Fetch POIs (encrypted data only)
    const pois = await POI.find(query)
      .select("encryptedName encryptedLat encryptedLon category createdBy createdAt")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      message: "POIs retrieved successfully",
      pois,
    })
  } catch (error) {
    console.error("Search POIs error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
