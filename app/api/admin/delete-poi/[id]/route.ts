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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Delete the POI
    const deletedPOI = await POI.findByIdAndDelete(id)

    if (!deletedPOI) {
      return NextResponse.json({ message: "POI not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "POI deleted successfully",
    })
  } catch (error) {
    console.error("Delete POI error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
