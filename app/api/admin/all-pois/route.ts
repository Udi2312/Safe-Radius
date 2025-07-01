import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import POI from "@/models/POI"
export const dynamic = "force-dynamic";

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

    // Fetch all POIs with creator information (unencrypted data for admin)
    const pois = await POI.find()
      .populate("createdBy", "name email")
      .select("name address area city pinCode category createdBy createdAt")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      message: "All POIs retrieved successfully",
      pois,
    })
  } catch (error) {
    console.error("Get all POIs error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
