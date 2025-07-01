import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "saferadius-jwt-secret-2024"

interface DecodedToken {
  userId: string
  email: string
  role: string
}

export async function PUT(request: NextRequest) {
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

    const { userId, newRole } = await request.json()

    // Validate input
    if (!userId || !newRole) {
      return NextResponse.json({ message: "User ID and new role are required" }, { status: 400 })
    }

    // Validate role
    if (!["user", "owner", "admin"].includes(newRole)) {
      return NextResponse.json({ message: "Invalid role specified" }, { status: 400 })
    }

    await connectDB()

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("name email role")

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update role error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
